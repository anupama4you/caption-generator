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

const contentFormatEnum = z.enum([
  'short_video',
  'long_video',
  'image',
  'carousel',
  'story',
  'text_only',
]);

export const generateCaptionSchema = z.object({
  platforms: z
    .array(platformEnum, { required_error: 'At least one platform is required' })
    .min(1, 'At least one platform is required')
    .max(10, 'Maximum 10 platforms allowed'),
  contentFormat: contentFormatEnum,
  contentDescription: z
    .string({ required_error: 'Content description is required' })
    .min(1, 'Content description is required')
    .max(2000, 'Content description must be less than 2000 characters')
    .trim(),
  niche: z.string().max(100).optional(),
  brandVoice: z.string().max(100).optional(),
  targetAudience: z.string().max(200).optional(),
  emojiPreference: z.boolean().optional().default(true),
  toneOfVoice: z.string().max(50).optional(),
  includeQuestions: z.boolean().optional(),
  ctaStyle: z.enum(['strong', 'moderate', 'none']).optional(),
  avoidClickbait: z.boolean().optional(),
  formalityLevel: z.enum(['formal', 'balanced', 'casual']).optional(),
});

export const saveGuestCaptionsSchema = z.object({
  captions: z
    .array(
      z.object({
        platform: platformEnum,
        variantNumber: z.number().int().min(1).max(3),
        generatedCaption: z.string().min(1),
        title: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        hashtags: z.array(z.string()).optional().default([]),
        hashtagReason: z.string().optional().nullable(),
        storySlides: z.array(z.string()).optional().default([]),
        analytics: z
          .object({
            engagementScore: z.number().optional(),
            reachEstimate: z.string().optional(),
            viralityScore: z.number().optional(),
            hashtagScore: z.number().optional(),
            lengthScore: z.number().optional(),
            emojiScore: z.number().optional(),
            timingScore: z.number().optional(),
            keywordScore: z.number().optional(),
            bestPostingTime: z.array(z.string()).optional(),
            improvementTips: z.array(z.string()).optional(),
          })
          .optional(),
      })
    )
    .min(1, 'At least one caption is required'),
  contentFormat: contentFormatEnum.optional(),
  contentDescription: z.string().optional(),
});

export const attemptIdParamSchema = z.object({
  id: z.string().uuid('Invalid attempt ID format'),
});

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive().default(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().positive().max(100).default(10)),
});

export type GenerateCaptionInput = z.infer<typeof generateCaptionSchema>;
export type SaveGuestCaptionsInput = z.infer<typeof saveGuestCaptionsSchema>;
export type AttemptIdParam = z.infer<typeof attemptIdParamSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
