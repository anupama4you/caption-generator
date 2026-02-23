import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { stripeService } from '../services/stripe.service';
import { getMonthlyLimit } from '../config/subscription.config';

export class SubscriptionController {
  /**
   * Direct subscription tier change endpoint
   * SECURITY: Disabled for upgrades - must go through Stripe checkout
   */
  async upgradeSubscription(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(403).json({
        error: 'Upgrades must go through payment flow',
        message: 'Please use the checkout endpoint to start a trial or subscribe',
        redirectTo: '/api/payment/create-checkout-session',
      });
    } catch (error) {
      console.error('Upgrade subscription error:', error);
      return res.status(500).json({ error: 'Failed to process subscription request' });
    }
  }

  /**
   * Get current subscription details including trial info
   */
  async getSubscription(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          subscriptionTier: true,
          subscriptionStart: true,
          subscriptionEnd: true,
          trialEndsAt: true,
          trialActivated: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get current month usage
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const usage = await prisma.usageTracking.findUnique({
        where: {
          userId_month_year: {
            userId,
            month: currentMonth,
            year: currentYear,
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: {
          tier: user.subscriptionTier,
          subscriptionStart: user.subscriptionStart,
          subscriptionEnd: user.subscriptionEnd,
          trialEndsAt: user.trialEndsAt,
          trialActivated: user.trialActivated,
          isOnTrial: user.subscriptionTier === 'TRIAL',
          usage: usage
            ? {
                current: usage.captionsGenerated,
                limit: usage.monthlyLimit,
                remaining: usage.monthlyLimit - usage.captionsGenerated,
              }
            : null,
        },
      });
    } catch (error) {
      console.error('Get subscription error:', error);
      return res.status(500).json({ error: 'Failed to get subscription details' });
    }
  }

  /**
   * Cancel subscription or trial
   * - TRIAL: immediate cancel, no charge, downgrade to FREE
   * - PREMIUM: cancel at period end, keep access until billing period ends
   */
  async cancelSubscription(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.subscriptionTier === 'FREE') {
        return res.status(400).json({ error: 'No active subscription to cancel' });
      }

      const isOnTrial = user.subscriptionTier === 'TRIAL';

      if (user.stripeSubscriptionId) {
        try {
          if (isOnTrial) {
            // Trial: immediate cancel, no charge
            await stripeService.cancelSubscription(user.stripeSubscriptionId);
          } else {
            // Paid: cancel at end of billing period (keep access)
            await stripeService.cancelSubscriptionAtPeriodEnd(user.stripeSubscriptionId);
          }
        } catch (stripeError) {
          console.error('Error canceling Stripe subscription:', stripeError);
        }
      }

      if (isOnTrial) {
        // Immediate downgrade for trial cancellation
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionTier: 'FREE',
            subscriptionStart: null,
            subscriptionEnd: null,
            stripeSubscriptionId: null,
            trialEndsAt: null,
          },
        });

        // Update usage limit immediately
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const freeLimit = getMonthlyLimit('FREE');

        await prisma.usageTracking.upsert({
          where: {
            userId_month_year: {
              userId,
              month: currentMonth,
              year: currentYear,
            },
          },
          update: { monthlyLimit: freeLimit },
          create: {
            userId,
            month: currentMonth,
            year: currentYear,
            captionsGenerated: 0,
            monthlyLimit: freeLimit,
          },
        });

        return res.status(200).json({
          success: true,
          message: 'Trial cancelled. You have been moved to the free plan.',
          data: { subscriptionTier: 'FREE' },
        });
      }

      // For PREMIUM: don't downgrade locally - the webhook handles it when period ends
      return res.status(200).json({
        success: true,
        message: `Subscription will be cancelled at the end of your billing period (${user.subscriptionEnd?.toLocaleDateString()}).`,
        data: {
          subscriptionTier: user.subscriptionTier,
          accessUntil: user.subscriptionEnd,
        },
      });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }
}
