import {
  CaptionGenerationParams,
  Platform,
  ContentFormat,
  PlatformCaptionResult
} from '../types';
import { OpenAIService } from './openai.service';

export class CaptionService {
  private openAI: OpenAIService;

  constructor() {
    this.openAI = new OpenAIService();
  }

  async generateCaptionsForAllPlatforms(
    params: CaptionGenerationParams
  ): Promise<PlatformCaptionResult[]> {
    const platforms = this.resolvePlatforms(params.platforms);

    // Single platform: focused single call
    if (platforms.length === 1) {
      return [await this.generateForPlatform(platforms[0], params)];
    }

    // 2-4 platforms: parallel individual calls — all run concurrently so total
    // time equals the slowest single call (~5-8s), not the sum of all calls.
    if (platforms.length <= 4) {
      return Promise.all(platforms.map(p => this.generateForPlatform(p, params)));
    }

    // 5+ platforms: one batched API call (cost-efficient for large selections)
    return this.generateBatched(platforms, params);
  }

  private async generateBatched(
    platforms: Platform[],
    params: CaptionGenerationParams
  ): Promise<PlatformCaptionResult[]> {
    // Build per-platform URL instructions if a link is in the description
    const detectedUrl = this.extractUrl(params.contentDescription);
    const urlInstructions: Partial<Record<string, string>> = {};
    if (detectedUrl) {
      for (const platform of platforms) {
        urlInstructions[platform] = this.getLinkInstruction(platform, detectedUrl);
      }
    }

    // Build a platform-agnostic user prompt
    const userPrompt = this.buildBaseUserPrompt(params);

    const userProfilePrefs = params.userProfile ? {
      toneOfVoice: params.userProfile.toneOfVoice || undefined,
      includeQuestions: params.userProfile.includeQuestions,
      ctaStyle: params.userProfile.ctaStyle || undefined,
      avoidClickbait: params.userProfile.avoidClickbait,
      formalityLevel: params.userProfile.formalityLevel || undefined,
      emojiPreference: params.userProfile.emojiPreference,
    } : undefined;

    const batchedResult = await this.openAI.generateCaptionsBatched(
      this.getSystemPrompt(),
      userPrompt,
      platforms,
      params.contentFormat,
      urlInstructions,
      userProfilePrefs
    );

    // Parse default hashtags from profile
    const defaultHashtags = params.userProfile?.defaultHashtags
      ? params.userProfile.defaultHashtags
          .split(/\s+/)
          .filter(tag => tag.trim())
          .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
      : [];

    return platforms.map((platform) => ({
      platform,
      variants: (batchedResult[platform]?.variants || []).map((v) => {
        const generatedHashtags = (v.hashtags || []).map(tag =>
          tag.startsWith('#') ? tag : `#${tag}`
        );
        return {
          caption: v.caption,
          title: v.title,
          description: v.description,
          hashtags: [...new Set([...generatedHashtags, ...defaultHashtags])],
          hashtagReason: v.hashtag_explanation,
          storySlides: v.story_slides,
        };
      }),
    }));
  }

  private buildBaseUserPrompt(params: CaptionGenerationParams): string {
    const {
      contentFormat,
      contentDescription,
      goal = 'engagement',
      targetAudience = 'general audience',
      tone = 'relatable',
      length = 'medium',
      hashtagLevel = 'medium',
      ctaType = [],
      keyPoints = [],
      avoid = [],
      niche,
      brandVoice,
      emojiPreference,
      hashtagCount,
    } = params;

    let prompt = `Format: ${contentFormat}
Goal: ${goal}
Audience: ${targetAudience}
Tone: ${tone}
Length: ${length}
Hashtag level: ${hashtagLevel}`;

    const profileSettings: string[] = [];
    if (brandVoice) profileSettings.push(`Brand voice: ${brandVoice}`);
    if (niche) profileSettings.push(`Niche: ${niche}`);
    if (emojiPreference !== undefined)
      profileSettings.push(`Emoji preference: ${emojiPreference ? 'use when natural' : 'avoid overuse'}`);
    if (hashtagCount !== undefined) profileSettings.push(`Preferred hashtag count: ${hashtagCount}`);
    if (profileSettings.length > 0) prompt += `\nProfile settings:\n- ${profileSettings.join('\n- ')}`;

    if (ctaType.length > 0) prompt += `\nCTA type: ${ctaType.join(', ')}`;

    prompt += `\n\nContent description:\n${contentDescription}`;

    if (keyPoints.length > 0) prompt += `\n\nKey points to include:\n${keyPoints.map(p => `- ${p}`).join('\n')}`;
    if (avoid.length > 0) prompt += `\n\nAvoid:\n${avoid.map(a => `- ${a}`).join('\n')}`;

    return prompt;
  }

  private resolvePlatforms(requested: Platform[]): Platform[] {
    if (requested.includes('all')) {
      return [
        'instagram',
        'tiktok',
        'youtube_shorts',
        'youtube_long',
        'facebook',
        'linkedin',
        'x',
        'pinterest',
        'snapchat',
      ];
    }
    return requested.filter((p) => p !== 'all');
  }

  private async generateForPlatform(
    platform: Platform,
    params: CaptionGenerationParams
  ): Promise<PlatformCaptionResult> {
    // Build the prompt
    const prompt = this.buildUserPrompt(platform, params);
    const systemPrompt = this.getSystemPrompt();
    const developerPrompt = this.getDeveloperPrompt(platform, params.contentFormat);

    // Extract user profile preferences for OpenAI
    const userProfilePrefs = params.userProfile ? {
      toneOfVoice: params.userProfile.toneOfVoice || undefined,
      includeQuestions: params.userProfile.includeQuestions,
      ctaStyle: params.userProfile.ctaStyle || undefined,
      avoidClickbait: params.userProfile.avoidClickbait,
      formalityLevel: params.userProfile.formalityLevel || undefined,
      emojiPreference: params.userProfile.emojiPreference,
    } : undefined;

    // Generate with OpenAI
    const response = await this.openAI.generateCaptionWithStructuredOutput(
      systemPrompt,
      developerPrompt,
      prompt,
      platform,
      params.contentFormat,
      userProfilePrefs
    );

    // Parse default hashtags from user profile
    const defaultHashtags = params.userProfile?.defaultHashtags
      ? params.userProfile.defaultHashtags
          .split(/\s+/)
          .filter(tag => tag.trim())
          .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
      : [];

    return {
      platform,
      variants: response.variants.map((v) => {
        // Merge default hashtags with generated hashtags, removing duplicates
        const generatedHashtags = (v.hashtags || []).map(tag =>
          tag.startsWith('#') ? tag : `#${tag}`
        );
        const allHashtags = [...new Set([...generatedHashtags, ...defaultHashtags])];

        return {
          caption: v.caption,
          title: v.title,
          description: v.description,
          hashtags: allHashtags,
          hashtagReason: v.hashtag_explanation,
          storySlides: v.story_slides,
        };
      }),
    };
  }

  private getSystemPrompt(): string {
    return `You are a professional social media caption writer and strategist.

You specialise in:
- Platform-specific caption writing
- Short-form video hooks
- Story overlay text
- Engagement-focused CTAs
- Clear, natural, human language

You always adapt:
- Length
- Tone
- Emoji usage
- Hashtag usage

to the selected platform and format.

You never explain your reasoning.
You only return valid JSON that follows the provided schema.
You do not include markdown or extra text.`;
  }

  private getDeveloperPrompt(platform: Platform, format: ContentFormat): string {
    const isStory = format === 'story';
    const needsHashtags = this.platformNeedsHashtags(platform, format);
    const isYouTube = platform === 'youtube_shorts' || platform === 'youtube_long';

    return `Generate 3 caption variants with DIFFERENT LENGTHS strictly following the JSON schema below.

IMPORTANT - Variant Length Requirements:
- Variant 1 (SHORT): Maximum 1 line (approx 10-15 words). Punchy, concise hook.
- Variant 2 (MEDIUM): 2-4 lines (approx 20-40 words). Balanced length with some context.
- Variant 3 (LONG): 5+ lines (approx 50-100 words). Detailed, storytelling approach with full context.

Rules:
- Do NOT add extra keys.
- Do NOT remove required keys.
- All strings must be plain text.
- Hashtags must not include punctuation.
- If hashtags are not recommended for the platform, return an empty array and explain why in \`hashtag_explanation\`.
- Platform tone rules:
  - TikTok / Instagram Reels: casual, hook-driven
  - YouTube Shorts: concise, curiosity-based (Title: max 100 chars, Description: 1-2 paragraphs)
  - YouTube Long: informative, keyword-rich (Title: max 100 chars, Description: detailed with timestamps if relevant)
  - Instagram Feed: expressive, balanced
  - Facebook: conversational, community-focused
  - LinkedIn: professional, reflective, no emojis unless requested
  - X (Twitter): short, sharp, conversational
  - Pinterest: descriptive, keyword-rich, actionable
  - Snapchat: ultra-casual, immediate

${isYouTube ? `YouTube-specific rules:
- Generate a compelling TITLE (max 100 characters) that's click-worthy but not clickbait
- Generate a detailed DESCRIPTION (2-5 sentences for Shorts, 2-3 paragraphs for Long videos)
- The 'caption' field will be a combination of title and description for display purposes
- Include relevant keywords in both title and description for SEO` : ''}

Story rules:
- ${isStory ? 'Story overlay text: max 8 words per slide' : 'Not a story format'}
- ${isStory ? 'Use 3–5 slides if story is enabled' : ''}
- ${isStory ? 'Suggest interactive stickers when possible' : ''}

Hashtag rules for ${platform}:
- ${needsHashtags ? this.getHashtagGuideline(platform) : 'Do NOT include hashtags for this platform/format'}

Return ONLY valid JSON matching this schema:
{
  "variants": [
    {
      "caption": "string"${isYouTube ? ',\n      "title": "string", // Required for YouTube\n      "description": "string" // Required for YouTube' : ''},
      "hashtags": ["string"] ${!needsHashtags ? '// empty array if not recommended' : ''},
      "hashtag_explanation": "string" ${!needsHashtags ? '// required if hashtags empty' : '// optional'},
      "story_slides": ["string"] ${isStory ? '// required for stories, 3-5 slides' : '// omit for non-story'}
    }
  ]
}`;
  }

  private extractUrl(text: string): string | null {
    const match = text.match(/https?:\/\/[^\s]+/);
    return match ? match[0] : null;
  }

  private getLinkInstruction(platform: Platform, url: string): string {
    const instructions: Record<Platform, string> = {
      instagram: `The user has provided this link: ${url}. Instagram does not allow clickable links in captions. Write "link in bio" naturally in the caption CTA (e.g., "Check the link in bio 👆"). Do NOT paste the URL in the caption.`,
      tiktok: `The user has provided this link: ${url}. TikTok does not allow clickable links in captions. Write "link in bio" naturally in the CTA. Do NOT paste the URL in the caption.`,
      youtube_shorts: `The user has provided this link: ${url}. Include this URL naturally in the description field (e.g., "Check it out: ${url}"). Do NOT put it in the caption field.`,
      youtube_long: `The user has provided this link: ${url}. Include this URL in the description field in a natural place (e.g., "Watch more: ${url}" or "Get started: ${url}"). Do NOT put it in the caption field.`,
      facebook: `The user has provided this link: ${url}. Include this URL directly in the caption at a natural CTA point (e.g., "Check it out here: ${url}").`,
      linkedin: `The user has provided this link: ${url}. Include this URL at the end of the caption or after the main CTA (e.g., "Read more: ${url}").`,
      x: `The user has provided this link: ${url}. Include this URL in the caption. Twitter auto-shortens links so it won't count much against character limits. Place it naturally at the end or mid-caption.`,
      pinterest: `The user has provided this link: ${url}. Include this URL in the caption as a CTA (e.g., "Get the full guide: ${url}").`,
      snapchat: `The user has provided this link: ${url}. Snapchat uses swipe-up links. Write "Swipe up!" as CTA in the caption. Do NOT paste the raw URL.`,
      all: `The user has provided this link: ${url}. Include it naturally in the caption where relevant (e.g., in the CTA). For platforms that don't support links (Instagram, TikTok), write "link in bio" instead.`,
    };
    return instructions[platform] ?? `The user has provided this link: ${url}. Include it naturally in the caption CTA.`;
  }

  private platformNeedsHashtags(platform: Platform, format: ContentFormat): boolean {
    // Stories don't need hashtags
    if (format === 'story') return false;

    // Platforms that don't typically use hashtags heavily
    if (platform === 'linkedin' || platform === 'facebook') return true; // but minimal
    if (platform === 'snapchat') return false;

    return true;
  }

  private getHashtagGuideline(platform: Platform): string {
    const guidelines: Record<string, string> = {
      instagram: 'Use 15-25 hashtags mixing trending, niche, and branded tags',
      tiktok: 'Use 3-5 highly relevant hashtags',
      youtube_shorts: 'Use 5-10 targeted hashtags',
      youtube_long: 'Use 8-15 SEO-friendly hashtags',
      facebook: 'Use 1-3 hashtags maximum',
      linkedin: 'Use 3-5 professional, niche hashtags',
      x: 'Use 2-6 sharp, trending hashtags',
      pinterest: 'Use 4-8 discovery-focused hashtags',
      snapchat: 'Hashtags not commonly used',
    };

    return guidelines[platform] || 'Use 5-10 relevant hashtags';
  }

  private buildUserPrompt(platform: Platform, params: CaptionGenerationParams): string {
    const {
      contentFormat,
      contentDescription,
      goal = 'engagement',
      targetAudience = 'general audience',
      tone = 'relatable',
      length = 'medium',
      hashtagLevel = 'medium',
      ctaType = [],
      keyPoints = [],
      avoid = [],
      niche,
      brandVoice,
      emojiPreference,
      storyEnabled,
      hashtagCount,
    } = params;

    let prompt = `Platform: ${platform}
Format: ${contentFormat}
Goal: ${goal}
Audience: ${targetAudience}
Tone: ${tone}
Length: ${length}
Hashtag level: ${hashtagLevel}`;

    const profileSettings: string[] = [];
    if (brandVoice) profileSettings.push(`Brand voice: ${brandVoice}`);
    if (niche) profileSettings.push(`Niche: ${niche}`);
    if (targetAudience) profileSettings.push(`Audience focus: ${targetAudience}`);
    if (emojiPreference !== undefined)
      profileSettings.push(
        `Emoji preference: ${emojiPreference ? 'use when natural' : 'avoid overuse'}`
      );
    if (hashtagCount !== undefined) profileSettings.push(`Preferred hashtag count: ${hashtagCount}`);

    if (profileSettings.length > 0) {
      prompt += `\nProfile settings:\n- ${profileSettings.join('\n- ')}`;
    }

    if (ctaType.length > 0) {
      prompt += `\nCTA type: ${ctaType.join(', ')}`;
    }

    prompt += `\n\nContent description:
${contentDescription}`;

    if (keyPoints.length > 0) {
      prompt += `\n\nKey points to include:
${keyPoints.map((p) => `- ${p}`).join('\n')}`;
    }

    if (avoid.length > 0) {
      prompt += `\n\nAvoid:
${avoid.map((a) => `- ${a}`).join('\n')}`;
    }

    if (storyEnabled !== undefined) {
      prompt += `\n\nStory enabled: ${storyEnabled}`;
    }

    // Detect URL in content description and add platform-specific link instruction
    const detectedUrl = this.extractUrl(contentDescription);
    if (detectedUrl) {
      prompt += `\n\n${this.getLinkInstruction(platform, detectedUrl)}`;
    }

    return prompt;
  }
}
