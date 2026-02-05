import { z } from 'zod';

const platformEnum = z.enum([
  'instagram',
  'tiktok',
  'youtube_shorts',
  'youtube_long',
  'facebook',
  'linkedin',
  'x',
  'pinterest',
  'snapchat',
  'all',
]);

export const updateProfileSchema = z.object({
  niche: z.string().max(100, 'Niche must be less than 100 characters').optional().nullable(),
  brandVoice: z.string().max(100, 'Brand voice must be less than 100 characters').optional().nullable(),
  targetAudience: z.string().max(200, 'Target audience must be less than 200 characters').optional().nullable(),
  preferredPlatforms: z.array(platformEnum).optional(),
  emojiPreference: z.boolean().optional(),
  defaultHashtags: z.string().max(500, 'Default hashtags must be less than 500 characters').optional().nullable(),
  toneOfVoice: z.string().max(50, 'Tone of voice must be less than 50 characters').optional().nullable(),
  includeQuestions: z.boolean().optional(),
  ctaStyle: z.enum(['strong', 'moderate', 'none']).optional(),
  avoidClickbait: z.boolean().optional(),
  formalityLevel: z.enum(['formal', 'balanced', 'casual']).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
