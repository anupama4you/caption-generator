import { Response, NextFunction } from 'express';
import { AuthRequest, Platform } from '../types';
import prisma from '../config/database';
import { getMonthlyLimit, SUBSCRIPTION_CONFIG } from '../config/subscription.config';

const DEFAULT_PLATFORMS: Platform[] = [
  'instagram',
  'tiktok',
  'youtube_shorts',
  'youtube_long',
  'facebook',
  'linkedin',
  'x',
  'pinterest',
  'snapchat',
];

export const checkCaptionLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Allow guest users to pass through without limit checking
    // Guest captions are handled separately in the controller
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Determine platforms we plan to generate for (use profile preferences when set)
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });
    const targetPlatforms =
      (profile?.preferredPlatforms && profile.preferredPlatforms.length > 0
        ? profile.preferredPlatforms
        : DEFAULT_PLATFORMS) as Platform[];
    // Get or create usage tracking record
    let usage = await prisma.usageTracking.findUnique({
      where: {
        userId_month_year: {
          userId,
          month: currentMonth,
          year: currentYear,
        },
      },
    });

    // Fetch user to check subscription status
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if PREMIUM subscription has expired and auto-downgrade
    let effectiveTier = user.subscriptionTier as 'FREE' | 'PREMIUM';
    if (
      user.subscriptionTier === 'PREMIUM' &&
      user.subscriptionEnd &&
      new Date() > new Date(user.subscriptionEnd)
    ) {
      // Auto-downgrade expired subscription
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: 'FREE',
          subscriptionStart: null,
          subscriptionEnd: null,
          stripeSubscriptionId: null,
        },
      });
      effectiveTier = 'FREE';
      console.log(`User ${userId} auto-downgraded due to expired subscription`);
    }

    if (!usage) {
      const monthlyLimit = getMonthlyLimit(effectiveTier);

      usage = await prisma.usageTracking.create({
        data: {
          userId,
          month: currentMonth,
          year: currentYear,
          captionsGenerated: 0,
          monthlyLimit,
        },
      });
    } else if (effectiveTier === 'FREE' && usage.monthlyLimit !== getMonthlyLimit('FREE')) {
      // Update usage limit if user was downgraded
      usage = await prisma.usageTracking.update({
        where: {
          userId_month_year: {
            userId,
            month: currentMonth,
            year: currentYear,
          },
        },
        data: {
          monthlyLimit: getMonthlyLimit('FREE'),
        },
      });
    }

    // Check if limit reached (block when already at or over limit)
    if (usage.captionsGenerated >= usage.monthlyLimit) {
      return res.status(403).json({
        error: 'Limit reached',
        message: `You've used all ${usage.monthlyLimit} of your monthly caption generations.`,
        upgrade: usage.monthlyLimit === SUBSCRIPTION_CONFIG.FREE.monthlyLimit,
        currentUsage: usage.captionsGenerated,
        limit: usage.monthlyLimit,
        remaining: 0,
      });
    }

    // Attach usage/context to request for later use
    req.usage = usage;
    req.userProfile = profile;
    req.targetPlatforms = targetPlatforms;
    return next();
  } catch (error) {
    console.error('Usage tracking error:', error);
    return res.status(500).json({ error: 'Failed to check usage limit' });
  }
};

export const incrementUsage = async (userId: string, incrementBy = 1): Promise<void> => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Fetch user to get their current tier for monthly limit
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  const monthlyLimit = getMonthlyLimit(user?.subscriptionTier as 'FREE' | 'PREMIUM' || 'FREE');

  await prisma.usageTracking.upsert({
    where: {
      userId_month_year: {
        userId,
        month: currentMonth,
        year: currentYear,
      },
    },
    update: {
      captionsGenerated: {
        increment: incrementBy,
      },
    },
    create: {
      userId,
      month: currentMonth,
      year: currentYear,
      captionsGenerated: incrementBy,
      monthlyLimit,
    },
  });
};
