export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier: 'FREE' | 'PREMIUM';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface CaptionAttempt {
  id: string;
  contentFormat: ContentType;
  contentDescription: string;
  niche?: string;
  brandVoice?: string;
  targetAudience?: string;
  emojiPreference: boolean;
  hashtagCount: number;
  isFavorite: boolean;
  createdAt: string;
  captions: Caption[];
  _count?: {
    captions: number;
  };
}

export interface Caption {
  id: string;
  attemptId: string;
  platform: Platform;
  variantNumber: number; // 1, 2, or 3
  generatedCaption: string;
  hashtags: string[];
  hashtagReason?: string;
  storySlides?: string[];
  createdAt: string;
  analytics?: CaptionAnalytics;
  // Backwards compatibility
  contentType?: ContentType;
  contentDescription?: string;
  isFavorite?: boolean;
}

export interface CaptionAnalytics {
  id: string;
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
export type ContentType = 'short_video' | 'long_video' | 'image' | 'carousel' | 'story' | 'text_only';

export interface UserProfile {
  id: string;
  userId: string;
  niche?: string;
  brandVoice?: string;
  targetAudience?: string;
  emojiPreference: boolean;
  hashtagCount: number;
}

export interface UsageStats {
  captionsGenerated: number;
  monthlyLimit: number;
}
