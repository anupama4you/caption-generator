import {
  Instagram, Facebook, Youtube, Video, Linkedin, Twitter, Ghost, Clapperboard, Layers, Image, Camera, FileText
} from 'lucide-react';
import facebookLogo from '../assets/images/facebook.png';
import instagramLogo from '../assets/images/instagram.png';
import tiktokLogo from '../assets/images/tiktok.png';
import youtubeLogo from '../assets/images/youtube.png';
import snapchatLogo from '../assets/images/snapchat.png';
import linkedinLogo from '../assets/images/linkedin.png';
import twitterLogo from '../assets/images/twitter.png';
import { Platform, ContentType } from '../types';

export interface PlatformConfig {
  value: Platform;
  label: string;
  icon: any;
  color: string;
  supportedContentTypes: ContentType[];
}

export interface ContentTypeConfig {
  value: ContentType;
  label: string;
  icon: any;
}

export const PLATFORMS: PlatformConfig[] = [
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500', supportedContentTypes: ['short_video', 'image', 'carousel', 'story'] },
  { value: 'tiktok', label: 'TikTok', icon: Video, color: 'from-gray-900 to-gray-700', supportedContentTypes: ['short_video'] },
  { value: 'youtube_shorts', label: 'YouTube Shorts', icon: Youtube, color: 'from-red-600 to-red-400', supportedContentTypes: ['short_video'] },
  { value: 'youtube_long', label: 'YouTube Long', icon: Clapperboard, color: 'from-red-500 to-amber-500', supportedContentTypes: ['long_video'] },
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-400', supportedContentTypes: ['short_video', 'long_video', 'image', 'carousel', 'story', 'text_only'] },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'from-sky-600 to-blue-400', supportedContentTypes: ['long_video', 'image', 'carousel', 'text_only'] },
  { value: 'x', label: 'X (Twitter)', icon: Twitter, color: 'from-gray-900 to-gray-700', supportedContentTypes: ['image', 'text_only'] },
  { value: 'snapchat', label: 'Snapchat', icon: Ghost, color: 'from-yellow-400 to-amber-300', supportedContentTypes: ['short_video', 'image', 'story'] },
];

export const CONTENT_TYPES: ContentTypeConfig[] = [
  { value: 'short_video', label: 'Short Video', icon: Video },
  { value: 'long_video', label: 'Long Video', icon: Clapperboard },
  { value: 'image', label: 'Image', icon: Image },
  { value: 'carousel', label: 'Carousel', icon: Layers },
  { value: 'story', label: 'Story', icon: Camera },
  { value: 'text_only', label: 'Text Only', icon: FileText },
];

export const PLATFORM_LOGOS: Partial<Record<Platform, string>> = {
  instagram: instagramLogo,
  tiktok: tiktokLogo,
  youtube_shorts: youtubeLogo,
  youtube_long: youtubeLogo,
  facebook: facebookLogo,
  linkedin: linkedinLogo,
  x: twitterLogo,
  snapchat: snapchatLogo,
};

// Maximum platforms allowed for free users
export const MAX_FREE_PLATFORMS = 2;

// Get platform config by value
export const getPlatformConfig = (platform: Platform): PlatformConfig | undefined => {
  return PLATFORMS.find(p => p.value === platform);
};

// Get content type config by value
export const getContentTypeConfig = (contentType: ContentType): ContentTypeConfig | undefined => {
  return CONTENT_TYPES.find(c => c.value === contentType);
};

// Get available platforms for a content type
export const getAvailablePlatformsForContentType = (contentType: ContentType): PlatformConfig[] => {
  return PLATFORMS.filter(p => p.supportedContentTypes.includes(contentType));
};
