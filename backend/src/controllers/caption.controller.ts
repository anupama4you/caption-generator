import { Response } from 'express';
import { AuthRequest, CaptionGenerationParams } from '../types';
import prisma from '../config/database';
import { CaptionService } from '../services/caption.service';
import { AnalyticsService } from '../services/analytics.service';
import { incrementUsage } from '../middleware/usageTracker.middleware';

const captionService = new CaptionService();
const analyticsService = new AnalyticsService();

export class CaptionController {
  async generateCaption(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = req.user.id;
      const { contentType, contentDescription } = req.body;

      if (!contentType || !contentDescription) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Determine platforms (use user preference if middleware set it)
      const targetPlatforms =
        req.targetPlatforms && req.targetPlatforms.length > 0
          ? req.targetPlatforms
          : (['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'YOUTUBE'] as CaptionGenerationParams['platform'][]);

      // Get user profile for context (prefer middleware-fetched profile)
      const userProfile =
        req.userProfile ??
        (await prisma.userProfile.findUnique({
          where: { userId },
        }));

      const generatedCaptions = [];

      for (const platform of targetPlatforms) {
        // Generate caption using OpenAI
        const result = await captionService.generateCaption({
          platform,
          contentType,
          contentDescription,
          niche: userProfile?.niche || undefined,
          brandVoice: userProfile?.brandVoice || undefined,
          targetAudience: userProfile?.targetAudience || undefined,
          emojiPreference: userProfile?.emojiPreference,
          hashtagCount: userProfile?.hashtagCount || 10,
        });

        // Save caption to database
        const caption = await prisma.caption.create({
          data: {
            userId,
            platform,
            contentType,
            contentDescription,
            generatedCaption: result.caption,
            hashtags: result.hashtags,
          },
        });

        // Generate analytics
        const analytics = await analyticsService.predictCaptionAnalytics(
          result.caption,
          result.hashtags,
          platform,
          userProfile
        );

        // Save analytics
        await prisma.captionAnalytics.create({
          data: {
            captionId: caption.id,
            engagementScore: analytics.engagementScore,
            reachEstimate: analytics.reachEstimate,
            viralityScore: analytics.viralityScore,
            hashtagScore: analytics.hashtagScore,
            lengthScore: analytics.lengthScore,
            emojiScore: analytics.emojiScore,
            timingScore: analytics.timingScore,
            keywordScore: analytics.keywordScore,
            bestPostingTime: analytics.bestPostingTimes,
            improvementTips: analytics.improvementTips,
          },
        });

        // Return complete result
        const fullCaption = await prisma.caption.findUnique({
          where: { id: caption.id },
          include: {
            analytics: true,
          },
        });

        if (fullCaption) {
          generatedCaptions.push(fullCaption);
        }
      }

      // Increment usage for all generated captions
      await incrementUsage(userId);

      return res.json({
        success: true,
        data: generatedCaptions,
      });
    } catch (error) {
      console.error('Caption generation error:', error);
      return res.status(500).json({
        error: 'Failed to generate caption',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getCaptions(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [captions, total] = await Promise.all([
        prisma.caption.findMany({
          where: { userId: req.user.id },
          include: { analytics: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.caption.count({ where: { userId: req.user.id } }),
      ]);

      return res.json({
        success: true,
        data: captions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get captions error:', error);
      return res.status(500).json({ error: 'Failed to get captions' });
    }
  }

  async getCaption(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const caption = await prisma.caption.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
        include: { analytics: true },
      });

      if (!caption) {
        return res.status(404).json({ error: 'Caption not found' });
      }

      return res.json({ success: true, data: caption });
    } catch (error) {
      console.error('Get caption error:', error);
      return res.status(500).json({ error: 'Failed to get caption' });
    }
  }

  async toggleFavorite(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const caption = await prisma.caption.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!caption) {
        return res.status(404).json({ error: 'Caption not found' });
      }

      const updated = await prisma.caption.update({
        where: { id: caption.id },
        data: { isFavorite: !caption.isFavorite },
      });

      return res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Toggle favorite error:', error);
      return res.status(500).json({ error: 'Failed to toggle favorite' });
    }
  }

  async deleteCaption(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const caption = await prisma.caption.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!caption) {
        return res.status(404).json({ error: 'Caption not found' });
      }

      await prisma.caption.delete({
        where: { id: caption.id },
      });

      return res.json({ success: true, message: 'Caption deleted' });
    } catch (error) {
      console.error('Delete caption error:', error);
      return res.status(500).json({ error: 'Failed to delete caption' });
    }
  }
}
