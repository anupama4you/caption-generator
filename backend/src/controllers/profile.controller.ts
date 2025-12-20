import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';

export class ProfileController {
  async getProfile(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const profile = await prisma.userProfile.findUnique({
        where: { userId: req.user.id },
      });

      return res.json({ success: true, data: profile });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        niche,
        brandVoice,
        targetAudience,
        emojiPreference,
        defaultHashtags,
        toneOfVoice,
        includeQuestions,
        ctaStyle,
        avoidClickbait,
        formalityLevel
      } = req.body;

      const profile = await prisma.userProfile.upsert({
        where: { userId: req.user.id },
        update: {
          niche,
          brandVoice,
          targetAudience,
          emojiPreference,
          defaultHashtags,
          toneOfVoice,
          includeQuestions,
          ctaStyle,
          avoidClickbait,
          formalityLevel,
        },
        create: {
          userId: req.user.id,
          niche,
          brandVoice,
          targetAudience,
          emojiPreference: emojiPreference ?? true,
          defaultHashtags,
          toneOfVoice,
          includeQuestions: includeQuestions ?? true,
          ctaStyle: ctaStyle || 'moderate',
          avoidClickbait: avoidClickbait ?? false,
          formalityLevel: formalityLevel || 'balanced',
        },
      });

      return res.json({ success: true, data: profile });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  async getUsage(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const usage = await prisma.usageTracking.findUnique({
        where: {
          userId_month_year: {
            userId: req.user.id,
            month: currentMonth,
            year: currentYear,
          },
        },
      });

      res.json({
        success: true,
        data: usage || {
          captionsGenerated: 0,
          monthlyLimit: req.user.subscriptionTier === 'FREE' ? 10 : 100,
        },
      });
    } catch (error) {
      console.error('Get usage error:', error);
      return res.status(500).json({ error: 'Failed to get usage' });
    }
  }
}
