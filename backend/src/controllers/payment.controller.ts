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

      if (!userId || !userEmail) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Create success and cancel URLs
      const successUrl = `${config.frontendUrl}/pricing?session_id={CHECKOUT_SESSION_ID}&success=true`;
      const cancelUrl = `${config.frontendUrl}/pricing?canceled=true`;

      // Create checkout session
      const session = await stripeService.createCheckoutSession(
        userId,
        userEmail,
        successUrl,
        cancelUrl
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
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

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
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
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
}
