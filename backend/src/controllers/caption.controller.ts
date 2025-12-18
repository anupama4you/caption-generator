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

      const {
        platforms,
        contentFormat,
        contentDescription,
        ...otherParams
      }: CaptionGenerationParams = req.body;

      if (!platforms || platforms.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one platform is required',
        });
      }

      if (!contentFormat) {
        return res.status(400).json({
          success: false,
          message: 'Content format is required',
        });
      }

      if (!contentDescription || contentDescription.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Content description is required',
        });
      }

      // Get user profile for personalization
      const userProfile = req.userProfile;

      // Build complete params
      const params: CaptionGenerationParams = {
        platforms,
        contentFormat,
        contentDescription,
        niche: otherParams.niche || userProfile?.niche || undefined,
        brandVoice: otherParams.brandVoice || userProfile?.brandVoice || undefined,
        targetAudience: otherParams.targetAudience || userProfile?.targetAudience || undefined,
        emojiPreference: otherParams.emojiPreference ?? userProfile?.emojiPreference ?? true,
        hashtagCount: otherParams.hashtagCount || userProfile?.hashtagCount || 10,
        ...otherParams,
      };

      // Generate captions for all platforms
      const platformResults = await captionService.generateCaptionsForAllPlatforms(params);

      // Create caption attempt
      const attempt = await prisma.captionAttempt.create({
        data: {
          userId: req.user.id,
          contentFormat,
          contentDescription,
          niche: params.niche || null,
          brandVoice: params.brandVoice || null,
          targetAudience: params.targetAudience || null,
          emojiPreference: params.emojiPreference ?? true,
          hashtagCount: params.hashtagCount ?? 10,
        },
      });

      // Save all captions with their variants
      for (const platformResult of platformResults) {
        for (let i = 0; i < platformResult.variants.length; i++) {
          const variant = platformResult.variants[i];

          const caption = await prisma.caption.create({
            data: {
              attemptId: attempt.id,
              platform: platformResult.platform,
              variantNumber: i + 1,
              generatedCaption: variant.caption,
              hashtags: variant.hashtags || [],
              hashtagReason: variant.hashtagReason || null,
              storySlides: variant.storySlides || [],
            },
          });

          // Generate analytics for each variant
          const analytics = await analyticsService.predictPerformance(
            caption.generatedCaption,
            caption.hashtags,
            platformResult.platform,
            userProfile
          );

          await prisma.captionAnalytics.create({
            data: {
              captionId: caption.id,
              ...analytics,
            },
          });
        }
      }

      // Increment usage count
      await incrementUsage(req.user.id);

      // Fetch complete attempt with all captions
      const fullAttempt = await prisma.captionAttempt.findUnique({
        where: { id: attempt.id },
        include: {
          captions: {
            include: {
              analytics: true,
            },
            orderBy: [{ platform: 'asc' }, { variantNumber: 'asc' }],
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Captions generated successfully',
        data: fullAttempt,
      });
    } catch (error: any) {
      console.error('Caption generation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate caption',
        error: error.message,
      });
    }
  }

  async getAttempts(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [attempts, total] = await Promise.all([
        prisma.captionAttempt.findMany({
          where: { userId: req.user.id },
          include: {
            _count: {
              select: { captions: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.captionAttempt.count({ where: { userId: req.user.id } }),
      ]);

      return res.json({
        success: true,
        data: attempts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      console.error('Fetch attempts error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attempts',
        error: error.message,
      });
    }
  }

  async getAttemptById(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;

      const attempt = await prisma.captionAttempt.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
        include: {
          captions: {
            include: {
              analytics: true,
            },
            orderBy: [{ platform: 'asc' }, { variantNumber: 'asc' }],
          },
        },
      });

      if (!attempt) {
        return res.status(404).json({
          success: false,
          message: 'Attempt not found',
        });
      }

      return res.json({
        success: true,
        data: attempt,
      });
    } catch (error: any) {
      console.error('Fetch attempt error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attempt',
        error: error.message,
      });
    }
  }

  async toggleFavorite(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;

      const attempt = await prisma.captionAttempt.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!attempt) {
        return res.status(404).json({
          success: false,
          message: 'Attempt not found',
        });
      }

      const updated = await prisma.captionAttempt.update({
        where: { id },
        data: {
          isFavorite: !attempt.isFavorite,
        },
      });

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      console.error('Toggle favorite error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to toggle favorite',
        error: error.message,
      });
    }
  }

  async deleteAttempt(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;

      const attempt = await prisma.captionAttempt.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!attempt) {
        return res.status(404).json({
          success: false,
          message: 'Attempt not found',
        });
      }

      await prisma.captionAttempt.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: 'Attempt deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete attempt error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete attempt',
        error: error.message,
      });
    }
  }
}
