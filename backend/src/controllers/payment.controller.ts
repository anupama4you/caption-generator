import { Response } from 'express';
import { AuthRequest } from '../types';
import { stripeService } from '../services/stripe.service';
import { config } from '../config/env';
import prisma from '../config/database';

export class PaymentController {
  /**
   * Create a Stripe checkout session for Premium subscription
   */
  async createCheckoutSession(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;
      const { billingInterval = 'monthly' } = req.body;

      if (!userId || !userEmail) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate billing interval
      if (billingInterval !== 'monthly' && billingInterval !== 'yearly') {
        return res.status(400).json({ error: 'Invalid billing interval. Must be "monthly" or "yearly"' });
      }

      // Create success and cancel URLs
      const successUrl = `${config.frontendUrl}/pricing?session_id={CHECKOUT_SESSION_ID}&success=true`;
      const cancelUrl = `${config.frontendUrl}/pricing?canceled=true`;

      // Create checkout session with billing interval
      const session = await stripeService.createCheckoutSession(
        userId,
        userEmail,
        successUrl,
        cancelUrl,
        billingInterval as 'monthly' | 'yearly'
      );

      return res.status(200).json({
        success: true,
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      console.error('Create checkout session error:', error);
      return res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }

  /**
   * Verify checkout session and update subscription
   */
  async verifyCheckoutSession(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const sessionId = (req.body?.sessionId || req.query?.session_id || req.query?.sessionId) as
        | string
        | undefined;

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const session = await stripeService.getCheckoutSession(sessionId);

      if (!session || session.payment_status !== 'paid') {
        return res.status(400).json({ error: 'Session not paid or not found' });
      }

      const userId = session.client_reference_id || session.metadata?.userId;
      const subscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;
      const customerId = typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id;

      if (!userId || !subscriptionId) {
        return res.status(400).json({ error: 'Missing user or subscription data' });
      }

      // Align with webhook behavior: immediately mark user as PREMIUM
      const now = new Date();
      const subscriptionEnd = new Date(now);
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: 'PREMIUM',
          subscriptionStart: now,
          subscriptionEnd,
          stripeCustomerId: customerId || null,
          stripeSubscriptionId: subscriptionId || null,
        },
      });

      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      await prisma.usageTracking.upsert({
        where: {
          userId_month_year: {
            userId,
            month: currentMonth,
            year: currentYear,
          },
        },
        update: { monthlyLimit: 100 },
        create: {
          userId,
          month: currentMonth,
          year: currentYear,
          captionsGenerated: 0,
          monthlyLimit: 100,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Session verified and subscription upgraded',
        subscriptionTier: updatedUser.subscriptionTier,
        subscriptionStart: updatedUser.subscriptionStart,
        subscriptionEnd: updatedUser.subscriptionEnd,
      });
    } catch (error) {
      console.error('Verify checkout session error:', error);
      return res.status(500).json({ error: 'Failed to verify checkout session' });
    }
  }

  /**
   * Get Premium pricing from Stripe (both monthly and yearly)
   */
  async getPricing(_req: AuthRequest, res: Response): Promise<Response> {
    try {
      const pricing = await stripeService.getPremiumPricing();

      return res.status(200).json({
        success: true,
        pricing: {
          monthly: {
            amount: pricing.monthly.amount,
            currency: pricing.monthly.currency,
            interval: pricing.monthly.interval,
            name: pricing.monthly.productName,
          },
          yearly: {
            amount: pricing.yearly.amount,
            currency: pricing.yearly.currency,
            interval: pricing.yearly.interval,
            name: pricing.yearly.productName,
          },
          free: {
            amount: 0,
            currency: pricing.monthly.currency,
            interval: 'forever',
            name: 'Free',
          },
        },
      });
    } catch (error) {
      console.error('Get pricing error:', error);
      return res.status(500).json({ error: 'Failed to get pricing' });
    }
  }
}
