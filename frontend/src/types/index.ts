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

export interface Caption {
  id: string;
  platform: Platform;
  contentType: ContentType;
  contentDescription: string;
  generatedCaption: string;
  hashtags: string[];
  isFavorite: boolean;
  createdAt: string;
  analytics?: CaptionAnalytics;
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

export type Platform = 'INSTAGRAM' | 'TIKTOK' | 'FACEBOOK' | 'YOUTUBE';
export type ContentType = 'PHOTO' | 'REEL' | 'SHORT' | 'VIDEO' | 'POST';

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
