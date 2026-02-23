import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { getMonthlyLimit } from '../config/subscription.config';

/**
 * Middleware to check and enforce subscription expiration
 * Auto-downgrades expired PREMIUM/TRIAL subscriptions to FREE
 */
export const checkSubscriptionExpiry = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
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

    const tier = user.subscriptionTier;

    // Check if PREMIUM or TRIAL subscription has expired
    if (
      (tier === 'PREMIUM' || tier === 'TRIAL') &&
      user.subscriptionEnd &&
      new Date() > new Date(user.subscriptionEnd)
    ) {
      await downgradeExpiredSubscription(user.id);
      req.user.subscriptionTier = 'FREE';
      console.log(`User ${user.id} auto-downgraded due to expired subscription/trial`);
    }

    return next();
  } catch (error) {
    console.error('Subscription expiry check error:', error);
    return next();
  }
};

/**
 * Downgrade a user from PREMIUM/TRIAL to FREE
 */
async function downgradeExpiredSubscription(userId: string): Promise<void> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'FREE',
      subscriptionStart: null,
      subscriptionEnd: null,
      stripeSubscriptionId: null,
    },
  });

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
}

/**
 * Check if a user's subscription is active
 */
export const isSubscriptionActive = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionEnd: true,
    },
  });

  if (!user) return false;

  const tier = user.subscriptionTier;

  if (tier === 'FREE') return true;

  if ((tier === 'PREMIUM' || tier === 'TRIAL') && user.subscriptionEnd) {
    return new Date() <= new Date(user.subscriptionEnd);
  }

  return false;
};
