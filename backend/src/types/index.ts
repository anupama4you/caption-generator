import { Request } from 'express';
import { UsageTracking, UserProfile } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    subscriptionTier: string;
  };
  usage?: UsageTracking;
  userProfile?: UserProfile | null;
  targetPlatforms?: CaptionGenerationParams['platform'][];
}

export interface CaptionGenerationParams {
  platform: 'INSTAGRAM' | 'TIKTOK' | 'FACEBOOK' | 'YOUTUBE';
  contentType: 'PHOTO' | 'REEL' | 'SHORT' | 'VIDEO' | 'POST';
  contentDescription: string;
  niche?: string;
  brandVoice?: string;
  targetAudience?: string;
  emojiPreference?: boolean;
  hashtagCount?: number;
}

export interface CaptionResult {
  caption: string;
  hashtags: string[];
}

export interface AnalyticsFactors {
  hashtagScore: number;
  lengthScore: number;
  emojiScore: number;
  timingScore: number;
  keywordScore: number;
}

export interface PredictedMetrics {
  engagementScore: number;
  reachEstimate: string;
  viralityScore: number;
  hashtagScore: number;
  lengthScore: number;
  emojiScore: number;
  timingScore: number;
  keywordScore: number;
  bestPostingTimes: string[];
  improvementTips: string[];
}
