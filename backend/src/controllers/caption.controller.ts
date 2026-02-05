import { Response } from 'express';
import { AuthRequest, CaptionGenerationParams } from '../types';
import prisma from '../config/database';
import { CaptionService } from '../services/caption.service';
import { AnalyticsService } from '../services/analytics.service';
import { incrementUsage } from '../middleware/usageTracker.middleware';
import { getMonthlyLimit } from '../config/subscription.config';

const captionService = new CaptionService();
const analyticsService = new AnalyticsService();

export class CaptionController {
  async generateCaption(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
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

      // Get user profile for personalization (only if authenticated)
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
        userProfile: userProfile || undefined,
        ...otherParams,
      };

      // Generate captions for all platforms
      const platformResults = await captionService.generateCaptionsForAllPlatforms(params);

      // GUEST USER FLOW - Return captions directly without saving
      if (!req.user) {
        // Format the response similar to authenticated users but without database IDs
        const guestCaptions: any[] = [];

        for (const platformResult of platformResults) {
          for (let i = 0; i < platformResult.variants.length; i++) {
            const variant = platformResult.variants[i];

            // Generate analytics without saving
            const analytics = await analyticsService.predictPerformance(
              variant.caption,
              variant.hashtags || [],
              platformResult.platform,
              userProfile
            );

            guestCaptions.push({
              id: `guest-${platformResult.platform}-${i + 1}`,
              platform: platformResult.platform,
              variantNumber: i + 1,
              generatedCaption: variant.caption,
              title: variant.title || null,
              description: variant.description || null,
              hashtags: variant.hashtags || [],
              hashtagReason: variant.hashtagReason || null,
              storySlides: variant.storySlides || [],
              analytics: {
                id: `guest-analytics-${platformResult.platform}-${i + 1}`,
                ...analytics,
              },
            });
          }
        }

        return res.status(201).json({
          success: true,
          message: 'Captions generated successfully',
          isGuest: true,
          data: {
            id: 'guest-attempt',
            captions: guestCaptions,
            contentFormat,
            contentDescription,
            createdAt: new Date().toISOString(),
          },
        });
      }

      // AUTHENTICATED USER FLOW - Save to database
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
              title: variant.title || null,
              description: variant.description || null,
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
        isGuest: false,
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
            captions: {
              include: {
                analytics: true,
              },
              orderBy: [{ platform: 'asc' }, { variantNumber: 'asc' }],
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

  async saveGuestCaptions(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { captions, contentFormat, contentDescription } = req.body;

      if (!captions || !Array.isArray(captions) || captions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Captions data is required',
        });
      }

      // Check if user has exceeded their monthly limit
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      let usage = await prisma.usageTracking.findUnique({
        where: {
          userId_month_year: {
            userId: req.user.id,
            month: currentMonth,
            year: currentYear,
          },
        },
      });

      if (!usage) {
        // Create usage tracking if it doesn't exist
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
        });

        const monthlyLimit = getMonthlyLimit((user?.subscriptionTier || 'FREE') as 'FREE' | 'PREMIUM');

        usage = await prisma.usageTracking.create({
          data: {
            userId: req.user.id,
            month: currentMonth,
            year: currentYear,
            captionsGenerated: 0,
            monthlyLimit,
          },
        });
      }

      // Check if saving this would exceed the limit
      if (usage.captionsGenerated + 1 > usage.monthlyLimit) {
        return res.status(403).json({
          success: false,
          message: 'Monthly limit reached',
          limitExceeded: true,
          currentUsage: usage.captionsGenerated,
          limit: usage.monthlyLimit,
        });
      }

      // Create a new caption attempt
      const attempt = await prisma.captionAttempt.create({
        data: {
          userId: req.user.id,
          contentFormat: contentFormat || 'post',
          contentDescription: contentDescription || 'Guest generated caption',
        },
      });

      // Save each caption
      const savedCaptions = [];
      for (const caption of captions) {
        const savedCaption = await prisma.caption.create({
          data: {
            attemptId: attempt.id,
            platform: caption.platform,
            variantNumber: caption.variantNumber,
            generatedCaption: caption.generatedCaption,
            title: caption.title,
            description: caption.description,
            hashtags: caption.hashtags || [],
            hashtagReason: caption.hashtagReason,
            storySlides: caption.storySlides || [],
          },
        });

        // Create analytics if provided
        if (caption.analytics) {
          await prisma.captionAnalytics.create({
            data: {
              captionId: savedCaption.id,
              engagementScore: caption.analytics.engagementScore || 0,
              reachEstimate: caption.analytics.reachEstimate || '0 - 0',
              viralityScore: caption.analytics.viralityScore || 0,
              hashtagScore: caption.analytics.hashtagScore || 0,
              lengthScore: caption.analytics.lengthScore || 0,
              emojiScore: caption.analytics.emojiScore || 0,
              timingScore: caption.analytics.timingScore || 0,
              keywordScore: caption.analytics.keywordScore || 0,
              bestPostingTime: caption.analytics.bestPostingTime || [],
              improvementTips: caption.analytics.improvementTips || [],
            },
          });
        }

        savedCaptions.push(savedCaption);
      }

      // Increment usage tracking (only takes userId and incrementBy)
      await incrementUsage(req.user.id, 1);

      return res.status(201).json({
        success: true,
        message: 'Guest captions saved successfully',
        data: {
          id: attempt.id,
          captionCount: savedCaptions.length,
        },
      });
    } catch (error: any) {
      console.error('Save guest captions error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save captions',
        error: error.message,
      });
    }
  }
}
