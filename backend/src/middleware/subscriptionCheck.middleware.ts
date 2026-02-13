import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { getMonthlyLimit } from '../config/subscription.config';

/**
 * Middleware to check and enforce subscription expiration
 * Auto-downgrades expired PREMIUM subscriptions to FREE
 */
export const checkSubscriptionExpiry = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Skip if no authenticated user
    if (!req.user) {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        subscriptionTier: true,
        subscriptionEnd: true,
      },
    });

    if (!user) {
      return next();
    }

    // Check if PREMIUM subscription has expired
    if (
      user.subscriptionTier === 'PREMIUM' &&
      user.subscriptionEnd &&
      new Date() > new Date(user.subscriptionEnd)
    ) {
      // Auto-downgrade to FREE
      await downgradeExpiredSubscription(user.id);

      // Update the user in the request to reflect the downgrade
      req.user.subscriptionTier = 'FREE';

      console.log(`User ${user.id} auto-downgraded due to expired subscription`);
    }

    return next();
  } catch (error) {
    console.error('Subscription expiry check error:', error);
    // Don't block the request on error, just log it
    return next();
  }
};

/**
 * Downgrade a user from PREMIUM to FREE
 */
async function downgradeExpiredSubscription(userId: string): Promise<void> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Update user subscription tier
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'FREE',
      subscriptionStart: null,
      subscriptionEnd: null,
      // Keep stripeCustomerId for future purchases
      stripeSubscriptionId: null,
    },
  });

  // Update usage limit for current month
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
}

/**
 * Utility function to check if a user's subscription is active
 * Can be used in services/controllers where middleware is not applicable
 */
export const isSubscriptionActive = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionEnd: true,
    },
  });

  if (!user) {
    return false;
  }

  // FREE tier is always "active"
  if (user.subscriptionTier === 'FREE') {
    return true;
  }

  // PREMIUM tier requires valid subscription end date
  if (user.subscriptionTier === 'PREMIUM' && user.subscriptionEnd) {
    return new Date() <= new Date(user.subscriptionEnd);
  }

  return false;
};
