import { Response } from 'express';
import { AuthRequest } from '../types';
import { stripeService } from '../services/stripe.service';
import { config } from '../config/env';
import prisma from '../config/database';
import { getMonthlyLimit, TRIAL_DURATION_DAYS } from '../config/subscription.config';

export class PaymentController {
  /**
   * Create a Stripe checkout session for Premium subscription
   * Automatically includes a 7-day free trial if user hasn't trialed before
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

      // Check current user state
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Block if already on PREMIUM or active TRIAL
      if (user.subscriptionTier === 'PREMIUM') {
        return res.status(400).json({ error: 'Already on Premium plan' });
      }
      if (user.subscriptionTier === 'TRIAL') {
        return res.status(400).json({ error: 'Already on a free trial' });
      }

      // Determine if user is eligible for trial
      const includeTrial = !user.trialActivated;

      // Create success and cancel URLs
      const successUrl = `${config.frontendUrl}/pricing?session_id={CHECKOUT_SESSION_ID}&success=true`;
      const cancelUrl = `${config.frontendUrl}/pricing?canceled=true`;

      const session = await stripeService.createCheckoutSession(
        userId,
        userEmail,
        successUrl,
        cancelUrl,
        billingInterval as 'monthly' | 'yearly',
        includeTrial
      );

      return res.status(200).json({
        success: true,
        sessionId: session.id,
        url: session.url,
        includeTrial,
      });
    } catch (error) {
      console.error('Create checkout session error:', error);
      return res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }

  /**
   * Verify checkout session and update subscription
   * Handles both trial and immediate-payment sessions
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

      // Trial sessions have payment_status 'no_payment_required', paid sessions have 'paid'
      if (!session || (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required')) {
        return res.status(400).json({ error: 'Session not valid or not found' });
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

      // Retrieve the Stripe subscription to check trial status
      const subscription = await stripeService.getSubscription(subscriptionId);
      const isTrialing = subscription.status === 'trialing';

      const now = new Date();
      const trialEndsAt = isTrialing && subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null;

      const tier = isTrialing ? 'TRIAL' : 'PREMIUM';
      const periodEnd = subscription.items.data[0]?.current_period_end;
      const subscriptionEnd = isTrialing
        ? trialEndsAt
        : periodEnd ? new Date(periodEnd * 1000) : new Date();

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: tier,
          subscriptionStart: now,
          subscriptionEnd,
          stripeCustomerId: customerId || null,
          stripeSubscriptionId: subscriptionId || null,
          trialEndsAt,
          trialActivated: true,
        },
      });

      // Update usage limits to Premium level
      const premiumLimit = getMonthlyLimit('PREMIUM');
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
        update: { monthlyLimit: premiumLimit },
        create: {
          userId,
          month: currentMonth,
          year: currentYear,
          captionsGenerated: 0,
          monthlyLimit: premiumLimit,
        },
      });

      return res.status(200).json({
        success: true,
        message: isTrialing ? 'Free trial activated!' : 'Subscription upgraded!',
        subscriptionTier: updatedUser.subscriptionTier,
        subscriptionStart: updatedUser.subscriptionStart,
        subscriptionEnd: updatedUser.subscriptionEnd,
        trialEndsAt: updatedUser.trialEndsAt,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          subscriptionTier: updatedUser.subscriptionTier,
          trialEndsAt: updatedUser.trialEndsAt,
          trialActivated: updatedUser.trialActivated,
        },
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
        },
        trial: {
          durationDays: TRIAL_DURATION_DAYS,
        },
      });
    } catch (error) {
      console.error('Get pricing error:', error);
      return res.status(500).json({ error: 'Failed to get pricing' });
    }
  }
}
