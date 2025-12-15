import { Platform } from '@prisma/client';
import prisma from '../config/database';
import { OpenAIService } from './openai.service';

export class TrendingHashtagService {
  private openAI: OpenAIService;

  constructor() {
    this.openAI = new OpenAIService();
  }

  async getTrendingForGeneration(platform: Platform, niche?: string, limit: number = 30) {
    const hashtags = await prisma.trendingHashtag.findMany({
      where: {
        platform,
        isActive: true,
        ...(niche && { category: niche }),
        trendScore: { gte: 50 },
      },
      orderBy: {
        trendScore: 'desc',
      },
      take: limit,
    });

    return hashtags;
  }

  async generateAITrendingHashtags(niche: string, platform: Platform) {
    try {
      const hashtags = await this.openAI.generateTrendingHashtags(niche, platform);

      // Store in database
      for (const tag of hashtags) {
        await prisma.trendingHashtag.upsert({
          where: {
            hashtag_platform: {
              hashtag: tag.hashtag,
              platform,
            },
          },
          update: {
            trendScore: tag.score,
            category: tag.category,
            lastUpdated: new Date(),
          },
          create: {
            hashtag: tag.hashtag,
            platform,
            trendScore: tag.score,
            category: tag.category,
          },
        });
      }

      return hashtags;
    } catch (error) {
      console.error('Failed to generate AI hashtags:', error);
      return [];
    }
  }

  async seedInitialHashtags() {
    const curatedTrends = [
      // Instagram
      { hashtag: '#instagood', platform: 'INSTAGRAM', category: 'general', score: 95 },
      { hashtag: '#photooftheday', platform: 'INSTAGRAM', category: 'general', score: 93 },
      { hashtag: '#love', platform: 'INSTAGRAM', category: 'general', score: 98 },
      { hashtag: '#fashion', platform: 'INSTAGRAM', category: 'fashion', score: 90 },
      { hashtag: '#fitness', platform: 'INSTAGRAM', category: 'fitness', score: 88 },
      { hashtag: '#foodie', platform: 'INSTAGRAM', category: 'food', score: 87 },
      { hashtag: '#travel', platform: 'INSTAGRAM', category: 'travel', score: 89 },

      // TikTok
      { hashtag: '#fyp', platform: 'TIKTOK', category: 'general', score: 99 },
      { hashtag: '#foryou', platform: 'TIKTOK', category: 'general', score: 98 },
      { hashtag: '#viral', platform: 'TIKTOK', category: 'general', score: 95 },
      { hashtag: '#trending', platform: 'TIKTOK', category: 'general', score: 93 },
      { hashtag: '#fitnessmotivation', platform: 'TIKTOK', category: 'fitness', score: 85 },
      { hashtag: '#foodtok', platform: 'TIKTOK', category: 'food', score: 86 },

      // Facebook
      { hashtag: '#facebook', platform: 'FACEBOOK', category: 'general', score: 80 },
      { hashtag: '#socialmedia', platform: 'FACEBOOK', category: 'general', score: 75 },
      { hashtag: '#community', platform: 'FACEBOOK', category: 'general', score: 78 },

      // YouTube
      { hashtag: '#youtube', platform: 'YOUTUBE', category: 'general', score: 92 },
      { hashtag: '#youtuber', platform: 'YOUTUBE', category: 'general', score: 88 },
      { hashtag: '#subscribe', platform: 'YOUTUBE', category: 'general', score: 85 },
    ];

    for (const trend of curatedTrends) {
      await prisma.trendingHashtag.upsert({
        where: {
          hashtag_platform: {
            hashtag: trend.hashtag,
            platform: trend.platform as Platform,
          },
        },
        update: {
          trendScore: trend.score,
          lastUpdated: new Date(),
        },
        create: {
          hashtag: trend.hashtag,
          platform: trend.platform as Platform,
          category: trend.category,
          trendScore: trend.score,
        },
      });
    }

    console.log('Seeded initial trending hashtags');
  }

  async deactivateOldHashtags() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    await prisma.trendingHashtag.updateMany({
      where: {
        lastUpdated: {
          lt: thirtyDaysAgo,
        },
      },
      data: {
        isActive: false,
      },
    });
  }
}
