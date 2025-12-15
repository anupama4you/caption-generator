import { Platform, UserProfile } from '@prisma/client';
import { PredictedMetrics } from '../types';
import { OpenAIService } from './openai.service';
import { TrendingHashtagService } from './trending.service';

export class AnalyticsService {
  private openAI: OpenAIService;
  private trendingService: TrendingHashtagService;

  constructor() {
    this.openAI = new OpenAIService();
    this.trendingService = new TrendingHashtagService();
  }

  async predictCaptionAnalytics(
    caption: string,
    hashtags: string[],
    platform: Platform,
    userProfile?: UserProfile | null
  ): Promise<PredictedMetrics> {
    // Calculate individual scores
    const hashtagScore = await this.calculateHashtagScore(hashtags, platform, userProfile?.niche);
    const lengthScore = this.calculateLengthScore(caption, platform);
    const emojiScore = this.calculateEmojiScore(caption, platform);
    const { score: timingScore, times: bestPostingTimes } = this.calculateTimingScore(
      platform,
      userProfile?.niche || undefined
    );
    const keywordScore = await this.openAI.scoreKeywordRelevance(
      caption,
      userProfile?.niche || 'general',
      platform
    );

    // Weighted engagement score
    const weights = {
      hashtag: 0.25,
      length: 0.2,
      emoji: 0.15,
      timing: 0.2,
      keyword: 0.2,
    };

    const engagementScore =
      hashtagScore * weights.hashtag +
      lengthScore * weights.length +
      emojiScore * weights.emoji +
      timingScore * weights.timing +
      keywordScore * weights.keyword;

    // Calculate reach estimate
    const reachEstimate = this.calculateReachEstimate(engagementScore, platform);

    // AI-assisted virality prediction
    const viralityScore = await this.openAI.predictVirality(caption, hashtags, platform);

    // Generate improvement tips
    const improvementTips = this.generateImprovementTips(
      { hashtagScore, lengthScore, emojiScore, keywordScore },
      platform
    );

    return {
      engagementScore: Math.round(engagementScore * 10) / 10,
      reachEstimate,
      viralityScore: Math.round(viralityScore * 10) / 10,
      hashtagScore: Math.round(hashtagScore * 10) / 10,
      lengthScore: Math.round(lengthScore * 10) / 10,
      emojiScore: Math.round(emojiScore * 10) / 10,
      timingScore: Math.round(timingScore * 10) / 10,
      keywordScore: Math.round(keywordScore * 10) / 10,
      bestPostingTimes,
      improvementTips,
    };
  }

  private async calculateHashtagScore(
    hashtags: string[],
    platform: Platform,
    niche?: string | null
  ): Promise<number> {
    const trendingHashtags = await this.trendingService.getTrendingForGeneration(
      platform,
      niche || undefined
    );

    let score = 0;

    // Optimal hashtag count per platform
    const optimalCounts: Record<Platform, { min: number; max: number }> = {
      INSTAGRAM: { min: 20, max: 30 },
      TIKTOK: { min: 3, max: 5 },
      FACEBOOK: { min: 1, max: 3 },
      YOUTUBE: { min: 10, max: 15 },
    };

    const optimal = optimalCounts[platform];

    // Count score (30 points)
    if (hashtags.length >= optimal.min && hashtags.length <= optimal.max) {
      score += 30;
    } else {
      score += 30 * (1 - Math.abs(hashtags.length - optimal.min) / optimal.max);
    }

    // Trending score (40 points)
    const trendingMatches = hashtags.filter((tag) =>
      trendingHashtags.some((t) => t.hashtag === tag && t.trendScore > 50)
    );
    score += (trendingMatches.length / Math.max(hashtags.length, 1)) * 40;

    // Diversity score (30 points) - basic check
    score += 30;

    return Math.min(100, score);
  }

  private calculateLengthScore(caption: string, platform: Platform): number {
    const length = caption.length;

    // Optimal caption lengths per platform
    const optimalRanges: Record<Platform, { min: number; max: number }> = {
      INSTAGRAM: { min: 138, max: 150 },
      TIKTOK: { min: 100, max: 150 },
      FACEBOOK: { min: 40, max: 80 },
      YOUTUBE: { min: 200, max: 300 },
    };

    const range = optimalRanges[platform];

    if (length >= range.min && length <= range.max) {
      return 100;
    } else if (length < range.min) {
      return (length / range.min) * 100;
    } else {
      return Math.max(0, 100 - ((length - range.max) / range.max) * 50);
    }
  }

  private calculateEmojiScore(caption: string, platform: Platform): number {
    const emojiRegex =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    const emojis = caption.match(emojiRegex) || [];
    const emojiCount = emojis.length;

    // Optimal emoji count per platform
    const optimalEmojis: Record<Platform, { min: number; max: number }> = {
      INSTAGRAM: { min: 3, max: 8 },
      TIKTOK: { min: 2, max: 5 },
      FACEBOOK: { min: 1, max: 3 },
      YOUTUBE: { min: 2, max: 5 },
    };

    const optimal = optimalEmojis[platform];

    if (emojiCount >= optimal.min && emojiCount <= optimal.max) {
      return 100;
    } else if (emojiCount === 0) {
      return 50;
    } else if (emojiCount < optimal.min) {
      return 50 + (emojiCount / optimal.min) * 50;
    } else {
      return Math.max(50, 100 - ((emojiCount - optimal.max) / optimal.max) * 50);
    }
  }

  private calculateTimingScore(
    platform: Platform,
    niche?: string
  ): { score: number; times: string[] } {
    // Best posting times based on platform and niche
    const bestTimes: Record<Platform, Record<string, string[]>> = {
      INSTAGRAM: {
        general: ['9:00 AM', '11:00 AM', '7:00 PM'],
        fitness: ['6:00 AM', '12:00 PM', '6:00 PM'],
        food: ['11:00 AM', '1:00 PM', '7:00 PM'],
        travel: ['9:00 AM', '5:00 PM', '8:00 PM'],
      },
      TIKTOK: {
        general: ['6:00 AM', '10:00 AM', '7:00 PM', '9:00 PM'],
        fitness: ['6:00 AM', '5:00 PM', '8:00 PM'],
        food: ['12:00 PM', '7:00 PM', '9:00 PM'],
        travel: ['9:00 AM', '6:00 PM', '9:00 PM'],
      },
      FACEBOOK: {
        general: ['9:00 AM', '1:00 PM', '3:00 PM'],
        fitness: ['7:00 AM', '12:00 PM', '6:00 PM'],
        food: ['11:00 AM', '1:00 PM', '6:00 PM'],
        travel: ['10:00 AM', '2:00 PM', '7:00 PM'],
      },
      YOUTUBE: {
        general: ['2:00 PM', '4:00 PM', '9:00 PM'],
        fitness: ['6:00 AM', '5:00 PM', '8:00 PM'],
        food: ['12:00 PM', '6:00 PM', '8:00 PM'],
        travel: ['3:00 PM', '6:00 PM', '9:00 PM'],
      },
    };

    const times = bestTimes[platform][niche || 'general'] || bestTimes[platform].general;
    return { score: 100, times };
  }

  private calculateReachEstimate(score: number, platform: Platform): string {
    const multipliers: Record<Platform, number> = {
      INSTAGRAM: 100,
      TIKTOK: 200,
      FACEBOOK: 50,
      YOUTUBE: 300,
    };

    const base = multipliers[platform];
    const min = Math.round(score * base);
    const max = Math.round(score * base * 2);

    return this.formatNumber(min) + ' - ' + this.formatNumber(max);
  }

  private generateImprovementTips(
    scores: {
      hashtagScore: number;
      lengthScore: number;
      emojiScore: number;
      keywordScore: number;
    },
    platform: Platform
  ): string[] {
    const tips: string[] = [];

    // Content-first concise tips
    if (scores.keywordScore < 70) {
      tips.push('Tighten the hook and add 1-2 niche keywords plus a clear CTA');
    }
    if (scores.hashtagScore < 70) {
      tips.push('Swap in 2-3 fresher, niche-aligned hashtags; avoid generic tags');
    }
    if (scores.lengthScore < 70) {
      tips.push(`Trim or pad to the ${platform} sweet spot so the main value is above the fold`);
    }
    if (scores.emojiScore < 70) {
      tips.push('Use 1-3 relevant emojis to break lines and highlight the CTA');
    }

    // Add a short video/content suggestion per platform
    const videoSuggestions: Record<Platform, string> = {
      INSTAGRAM: 'Video idea: 15-30s reel with a 3-step visual, hook in first 2 seconds.',
      TIKTOK: 'Video idea: 10-20s punchy cut with on-screen text for the hook and CTA.',
      FACEBOOK: 'Video idea: 20-40s story-style clip with captions on, CTA in the first line.',
      YOUTUBE: 'Video idea: 45-90s short with a fast intro, chapter cues, and end-screen CTA.',
    };
    tips.push(videoSuggestions[platform]);

    // Keep tips concise and focused
    return tips.slice(0, 3);
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}
