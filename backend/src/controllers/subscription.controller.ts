import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { stripeService } from '../services/stripe.service';
import { getMonthlyLimit } from '../config/subscription.config';

export class SubscriptionController {
  /**
   * Direct subscription tier change endpoint
   * SECURITY: This endpoint is disabled for PREMIUM upgrades.
   * Premium upgrades must go through Stripe checkout flow.
   * This endpoint only allows checking current tier or administrative use.
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

      // SECURITY: Block direct PREMIUM upgrades - must go through Stripe
      if (tier === 'PREMIUM') {
        return res.status(403).json({
          error: 'Premium upgrades must go through payment flow',
          message: 'Please use the checkout endpoint to upgrade to Premium',
          redirectTo: '/api/payment/create-checkout-session',
        });
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

      // Only FREE tier changes are allowed through this endpoint
      // This is essentially a downgrade, so redirect to cancel endpoint
      return res.status(400).json({
        error: 'Use the cancel endpoint to downgrade',
        message: 'To downgrade to FREE, please use POST /api/subscription/cancel',
        redirectTo: '/api/subscription/cancel',
      });
    } catch (error) {
      console.error('Upgrade subscription error:', error);
      return res.status(500).json({ error: 'Failed to process subscription request' });
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

      await prisma.usageTracking.upsert({
        where: {
          userId_month_year: {
            userId,
            month: currentMonth,
            year: currentYear,
          },
        },
        update: {
          monthlyLimit: getMonthlyLimit('FREE'),
        },
        create: {
          userId,
          month: currentMonth,
          year: currentYear,
          captionsGenerated: 0,
          monthlyLimit: getMonthlyLimit('FREE'),
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
