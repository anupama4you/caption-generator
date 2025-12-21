import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { stripeService } from '../services/stripe.service';

export class SubscriptionController {
  /**
   * Upgrade user subscription to Premium
   */
  async upgradeSubscription(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { tier } = req.body;

      // Validate tier
      if (tier !== 'PREMIUM' && tier !== 'FREE') {
        return res.status(400).json({ error: 'Invalid subscription tier' });
      }

      // Get current user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if already on this tier
      if (user.subscriptionTier === tier) {
        return res.status(400).json({ error: `Already subscribed to ${tier} plan` });
      }

      // Calculate subscription dates
      const now = new Date();
      const subscriptionStart = now;
      const subscriptionEnd = new Date(now);
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

      // Update user subscription
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: tier,
          subscriptionStart: tier === 'PREMIUM' ? subscriptionStart : null,
          subscriptionEnd: tier === 'PREMIUM' ? subscriptionEnd : null,
        },
      });

      // Update usage tracking for current month
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const newMonthlyLimit = tier === 'PREMIUM' ? 100 : 10;

      // Update or create usage tracking with new limit
      await prisma.usageTracking.upsert({
        where: {
          userId_month_year: {
            userId,
            month: currentMonth,
            year: currentYear,
          },
        },
        update: {
          monthlyLimit: newMonthlyLimit,
        },
        create: {
          userId,
          month: currentMonth,
          year: currentYear,
          captionsGenerated: 0,
          monthlyLimit: newMonthlyLimit,
        },
      });

      return res.status(200).json({
        success: true,
        message: `Successfully upgraded to ${tier}`,
        data: {
          subscriptionTier: updatedUser.subscriptionTier,
          subscriptionStart: updatedUser.subscriptionStart,
          subscriptionEnd: updatedUser.subscriptionEnd,
        },
      });
    } catch (error) {
      console.error('Upgrade subscription error:', error);
      return res.status(500).json({ error: 'Failed to upgrade subscription' });
    }
  }

  /**
   * Get current subscription details
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
   * Cancel/downgrade subscription
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
        return res.status(400).json({ error: 'Already on free plan' });
      }

      // If user has a Stripe subscription, cancel it
      if (user.stripeSubscriptionId) {
        try {
          await stripeService.cancelSubscription(user.stripeSubscriptionId);
        } catch (stripeError) {
          console.error('Error canceling Stripe subscription:', stripeError);
          // Continue with local cancellation even if Stripe fails
        }
      }

      // Downgrade to FREE
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: 'FREE',
          subscriptionStart: null,
          subscriptionEnd: null,
          stripeSubscriptionId: null,
        },
      });

      // Update usage limit for current month
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      await prisma.usageTracking.update({
        where: {
          userId_month_year: {
            userId,
            month: currentMonth,
            year: currentYear,
          },
        },
        data: {
          monthlyLimit: 10,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: {
          subscriptionTier: updatedUser.subscriptionTier,
        },
      });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }
}
