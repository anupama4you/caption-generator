import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { TrendingHashtagService } from '../services/trending.service';

const trendingService = new TrendingHashtagService();

const VALID_PLATFORMS = [
  'instagram', 'tiktok', 'youtube_shorts', 'youtube_long',
  'facebook', 'linkedin', 'x', 'pinterest', 'snapchat',
];

function getReachEstimate(score: number): string {
  if (score >= 90) return '10M+';
  if (score >= 75) return '2M – 10M';
  if (score >= 60) return '500K – 2M';
  if (score >= 40) return '100K – 500K';
  return '10K – 100K';
}

export class HashtagController {
  /**
   * GET /api/hashtags/trending?platform=instagram&niche=fitness
   * Returns trending hashtags for a platform + niche combo.
   * Uses DB cache (24h) — generates via AI if stale.
   * Free/Trial users get 5 results; Premium get 20.
   */
  async getTrending(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const platform = (req.query.platform as string)?.toLowerCase().trim();
      const niche = (req.query.niche as string)?.toLowerCase().trim() || 'general';

      if (!platform || !VALID_PLATFORMS.includes(platform)) {
        return res.status(400).json({
          error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}`,
        });
      }

      const isPremium = req.user?.subscriptionTier === 'PREMIUM';

      // Check DB for recent data (< 24h)
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      let hashtags = await prisma.trendingHashtag.findMany({
        where: {
          platform: platform as any,
          category: niche,
          isActive: true,
          lastUpdated: { gte: cutoff },
        },
        orderBy: { trendScore: 'desc' },
        take: 25,
      });

      // Not enough fresh data — generate via AI and re-query
      if (hashtags.length < 5) {
        await trendingService.generateAITrendingHashtags(niche, platform as any);
        hashtags = await prisma.trendingHashtag.findMany({
          where: {
            platform: platform as any,
            category: niche,
            isActive: true,
          },
          orderBy: { trendScore: 'desc' },
          take: 25,
        });
      }

      const totalAvailable = hashtags.length;
      const limit = isPremium ? 20 : 5;
      const visible = hashtags.slice(0, limit);

      const data = visible.map(h => ({
        id: h.id,
        hashtag: h.hashtag,
        trendScore: Math.round(h.trendScore),
        reach: getReachEstimate(h.trendScore),
        category: h.category,
        lastUpdated: h.lastUpdated,
      }));

      return res.status(200).json({
        success: true,
        data: {
          hashtags: data,
          totalAvailable,
          isPremium,
          hasMore: !isPremium && totalAvailable > 5,
        },
      });
    } catch (error) {
      console.error('HashtagController.getTrending error:', error);
      return res.status(500).json({ error: 'Failed to fetch trending hashtags' });
    }
  }
}

export const hashtagController = new HashtagController();
