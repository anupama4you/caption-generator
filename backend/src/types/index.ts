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
  targetPlatforms?: Platform[];
}

export type Platform =
  | 'instagram'
  | 'tiktok'
  | 'youtube_shorts'
  | 'youtube_long'
  | 'facebook'
  | 'linkedin'
  | 'x'
  | 'pinterest'
  | 'snapchat'
  | 'all';

export type ContentFormat =
  | 'short_video'
  | 'long_video'
  | 'image'
  | 'carousel'
  | 'story'
  | 'text_only';

export interface CaptionGenerationParams {
  platforms: Platform[];
  contentFormat: ContentFormat;
  contentDescription: string;
  niche?: string;
  brandVoice?: string;
  targetAudience?: string;
  emojiPreference?: boolean;
  hashtagCount?: number;
  goal?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  hashtagLevel?: 'none' | 'low' | 'medium' | 'high';
  ctaType?: string[];
  keyPoints?: string[];
  avoid?: string[];
  storyEnabled?: boolean;
  userProfile?: UserProfile | null;
}

export interface CaptionVariant {
  caption: string;
  title?: string; // For YouTube (Shorts & Long)
  description?: string; // For YouTube (Shorts & Long)
  hashtags: string[];
  hashtagReason?: string; // Why hashtags not recommended
  storySlides?: string[]; // For story format
}

export interface PlatformCaptionResult {
  platform: Platform;
  variants: CaptionVariant[]; // 3 variants
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
  bestPostingTime: string[];
  improvementTips: string[];
}

// OpenAI Response Structure
export interface OpenAICaptionResponse {
  variants: {
    caption: string;
    title?: string; // For YouTube (Shorts & Long)
    description?: string; // For YouTube (Shorts & Long)
    hashtags?: string[];
    hashtag_explanation?: string;
    story_slides?: string[];
  }[];
}
