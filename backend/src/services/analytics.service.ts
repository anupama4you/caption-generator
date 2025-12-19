import { UserProfile } from '@prisma/client';
import { PredictedMetrics, Platform } from '../types';

export class AnalyticsService {
  constructor() {}

  async predictPerformance(
    caption: string,
    hashtags: string[],
    platform: Platform,
    userProfile?: UserProfile | null
  ): Promise<PredictedMetrics> {
    // Calculate individual scores
    const hashtagScore = this.calculateHashtagScore(hashtags, platform);
    const lengthScore = this.calculateLengthScore(caption, platform);
    const emojiScore = this.calculateEmojiScore(caption, platform);
    const { score: timingScore, times: bestPostingTimes } = this.calculateTimingScore(
      platform,
      userProfile?.niche || undefined
    );
    const keywordScore = this.calculateKeywordScore(
      caption,
      userProfile?.niche || 'general',
      hashtags
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
    const viralityScore = this.estimateViralityScore(
      caption,
      hashtags,
      platform,
      engagementScore
    );

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
      bestPostingTime: bestPostingTimes,
      improvementTips,
    };
  }

  private calculateHashtagScore(hashtags: string[], platform: Platform): number {
    let score = 0;

    // Optimal hashtag count per platform
    const optimalCounts: Record<Platform, { min: number; max: number }> = {
      instagram: { min: 15, max: 25 },
      tiktok: { min: 3, max: 5 },
      youtube_shorts: { min: 5, max: 10 },
      youtube_long: { min: 8, max: 15 },
      facebook: { min: 1, max: 3 },
      linkedin: { min: 3, max: 5 },
      x: { min: 2, max: 6 },
      pinterest: { min: 3, max: 8 },
      snapchat: { min: 1, max: 3 },
      all: { min: 5, max: 10 },
    };

    const optimal = optimalCounts[platform];

    // Count score (40 points)
    if (hashtags.length >= optimal.min && hashtags.length <= optimal.max) {
      score += 40;
    } else if (hashtags.length === 0) {
      // Stories or platforms that don't use hashtags
      score += 40;
    } else {
      score += 40 * (1 - Math.abs(hashtags.length - optimal.min) / optimal.max);
    }

    // Quality score (60 points) - basic diversity check
    const uniqueWords = new Set(
      hashtags.map((tag) => tag.toLowerCase().replace(/[^a-z0-9]/g, ''))
    );
    if (uniqueWords.size === hashtags.length) {
      score += 60;
    } else {
      score += (uniqueWords.size / Math.max(hashtags.length, 1)) * 60;
    }

    return Math.min(100, score);
  }

  private calculateLengthScore(caption: string, platform: Platform): number {
    const length = caption.length;

    // Optimal caption lengths per platform
    const optimalRanges: Record<Platform, { min: number; max: number }> = {
      instagram: { min: 100, max: 150 },
      tiktok: { min: 80, max: 130 },
      youtube_shorts: { min: 80, max: 130 },
      youtube_long: { min: 200, max: 300 },
      facebook: { min: 40, max: 80 },
      linkedin: { min: 60, max: 140 },
      x: { min: 80, max: 200 },
      pinterest: { min: 100, max: 160 },
      snapchat: { min: 40, max: 80 },
      all: { min: 80, max: 150 },
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
      instagram: { min: 3, max: 8 },
      tiktok: { min: 2, max: 5 },
      youtube_shorts: { min: 2, max: 5 },
      youtube_long: { min: 1, max: 4 },
      facebook: { min: 1, max: 3 },
      linkedin: { min: 0, max: 2 },
      x: { min: 1, max: 4 },
      pinterest: { min: 2, max: 5 },
      snapchat: { min: 1, max: 4 },
      all: { min: 2, max: 5 },
    };

    const optimal = optimalEmojis[platform];

    if (emojiCount >= optimal.min && emojiCount <= optimal.max) {
      return 100;
    } else if (emojiCount === 0 && platform === 'linkedin') {
      return 100; // LinkedIn is fine with no emojis
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
      instagram: {
        general: ['9:00 AM', '11:00 AM', '7:00 PM'],
        fitness: ['6:00 AM', '12:00 PM', '6:00 PM'],
        food: ['11:00 AM', '1:00 PM', '7:00 PM'],
        travel: ['9:00 AM', '5:00 PM', '8:00 PM'],
      },
      tiktok: {
        general: ['6:00 AM', '10:00 AM', '7:00 PM', '9:00 PM'],
        fitness: ['6:00 AM', '5:00 PM', '8:00 PM'],
        food: ['12:00 PM', '7:00 PM', '9:00 PM'],
        travel: ['9:00 AM', '6:00 PM', '9:00 PM'],
      },
      youtube_shorts: {
        general: ['12:00 PM', '4:00 PM', '8:00 PM'],
        fitness: ['7:00 AM', '12:00 PM', '8:00 PM'],
        food: ['11:00 AM', '1:00 PM', '7:00 PM'],
        travel: ['10:00 AM', '3:00 PM', '8:00 PM'],
      },
      youtube_long: {
        general: ['2:00 PM', '4:00 PM', '9:00 PM'],
        fitness: ['6:00 AM', '5:00 PM', '8:00 PM'],
        food: ['12:00 PM', '6:00 PM', '8:00 PM'],
        travel: ['3:00 PM', '6:00 PM', '9:00 PM'],
      },
      facebook: {
        general: ['9:00 AM', '1:00 PM', '3:00 PM'],
        fitness: ['7:00 AM', '12:00 PM', '6:00 PM'],
        food: ['11:00 AM', '1:00 PM', '6:00 PM'],
        travel: ['10:00 AM', '2:00 PM', '7:00 PM'],
      },
      linkedin: {
        general: ['8:00 AM', '10:00 AM', '6:00 PM'],
        fitness: ['6:00 AM', '12:00 PM', '6:00 PM'],
        food: ['8:00 AM', '12:00 PM', '5:00 PM'],
        travel: ['8:00 AM', '12:00 PM', '6:00 PM'],
      },
      x: {
        general: ['8:00 AM', '12:00 PM', '6:00 PM', '9:00 PM'],
        fitness: ['6:00 AM', '12:00 PM', '8:00 PM'],
        food: ['11:00 AM', '1:00 PM', '7:00 PM'],
        travel: ['9:00 AM', '5:00 PM', '9:00 PM'],
      },
      pinterest: {
        general: ['9:00 AM', '2:00 PM', '8:00 PM'],
        fitness: ['6:00 AM', '12:00 PM', '7:00 PM'],
        food: ['11:00 AM', '1:00 PM', '8:00 PM'],
        travel: ['10:00 AM', '3:00 PM', '7:00 PM'],
      },
      snapchat: {
        general: ['10:00 AM', '2:00 PM', '8:00 PM'],
        fitness: ['6:00 AM', '12:00 PM', '6:00 PM'],
        food: ['12:00 PM', '6:00 PM', '9:00 PM'],
        travel: ['11:00 AM', '3:00 PM', '8:00 PM'],
      },
      all: {
        general: ['9:00 AM', '1:00 PM', '7:00 PM'],
      },
    };

    const times = bestTimes[platform][niche || 'general'] || bestTimes[platform].general;
    return { score: 100, times };
  }

  private calculateReachEstimate(score: number, platform: Platform): string {
    const multipliers: Record<Platform, number> = {
      instagram: 120,
      tiktok: 200,
      youtube_shorts: 180,
      youtube_long: 250,
      facebook: 80,
      linkedin: 90,
      x: 110,
      pinterest: 100,
      snapchat: 130,
      all: 100,
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
      instagram: 'Idea: 15-30s reel/carousel with a 3-step visual, hook in first 2 seconds.',
      tiktok: 'Idea: 10-20s punchy cut with on-screen text for the hook and CTA.',
      youtube_shorts: 'Idea: 30-60s short with quick cuts, hook at 0-2s, CTA on-screen.',
      youtube_long: 'Idea: 5-10 min longform with chapters, value upfront, clear end-screen CTA.',
      facebook: 'Idea: 20-40s story-style clip with captions on, CTA in the first line.',
      linkedin: 'Idea: 30-60s value clip or doc-style carousel with 2-3 takeaways and CTA.',
      x: 'Idea: 10-20s vertical clip or punchy text thread; lead with hook and CTA early.',
      pinterest: 'Idea: 20-40s how-to clip or 5-card carousel with step-by-step overlays.',
      snapchat: 'Idea: 5-10s quick snap/short with bold text overlay and a single CTA.',
      all: 'Idea: Lead with the hook in 2s, CTA early, and keep visuals fast and caption scannable.',
    };
    tips.push(videoSuggestions[platform] || videoSuggestions.all);

    // Keep tips concise and focused
    return tips.slice(0, 3);
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  private calculateKeywordScore(caption: string, niche: string, hashtags: string[]): number {
    const normalizedCaption = caption.toLowerCase();
    const nicheWords = niche.toLowerCase().split(/\s+/).filter(Boolean);
    let hits = 0;

    for (const word of nicheWords) {
      if (normalizedCaption.includes(word)) {
        hits += 1;
      }
    }

    // Count niche words in hashtags too
    for (const tag of hashtags) {
      for (const word of nicheWords) {
        if (tag.toLowerCase().includes(word)) {
          hits += 0.5;
        }
      }
    }

    const diversityBonus = Math.min(20, new Set(hashtags.map((h) => h.toLowerCase())).size * 2);
    const baseScore = Math.min(100, (hits / Math.max(nicheWords.length || 1, 1)) * 70);

    return Math.round(Math.min(100, baseScore + diversityBonus));
  }

  private estimateViralityScore(
    caption: string,
    hashtags: string[],
    platform: Platform,
    engagementScore: number
  ): number {
    const hookScore = caption.length <= 180 ? 20 : 10;
    const hashtagBoost = Math.min(15, hashtags.length * 1.5);
    const platformBias: Record<Platform, number> = {
      instagram: 10,
      tiktok: 15,
      youtube_shorts: 12,
      youtube_long: 8,
      facebook: 6,
      linkedin: 4,
      x: 12,
      pinterest: 7,
      snapchat: 14,
      all: 8,
    };

    const base = engagementScore * 0.6 + hookScore + hashtagBoost + (platformBias[platform] || 5);
    return Math.round(Math.min(100, base));
  }
}
