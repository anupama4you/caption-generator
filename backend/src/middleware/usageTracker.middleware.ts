import { Response, NextFunction } from 'express';
import { AuthRequest, Platform } from '../types';
import prisma from '../config/database';

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
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
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
    const generationCost = 1;

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

    if (!usage) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const monthlyLimit = user.subscriptionTier === 'FREE' ? 5 : 100;

      usage = await prisma.usageTracking.create({
        data: {
          userId,
          month: currentMonth,
          year: currentYear,
          captionsGenerated: 0,
          monthlyLimit,
        },
      });
    }

    // Check if limit exceeded
    if (usage.captionsGenerated + generationCost > usage.monthlyLimit) {
      return res.status(403).json({
        error: 'Limit reached',
        message: `This generation would exceed your monthly limit of ${usage.monthlyLimit}.`,
        upgrade: usage.monthlyLimit === 5,
        currentUsage: usage.captionsGenerated,
        limit: usage.monthlyLimit,
        remaining: Math.max(usage.monthlyLimit - usage.captionsGenerated, 0),
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

  await prisma.usageTracking.update({
    where: {
      userId_month_year: {
        userId,
        month: currentMonth,
        year: currentYear,
      },
    },
    data: {
      captionsGenerated: {
        increment: incrementBy,
      },
    },
  });
};
