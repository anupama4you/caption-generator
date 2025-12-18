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
    const results: PlatformCaptionResult[] = [];

    // Determine which platforms to generate for
    const platforms = this.resolvePlatforms(params.platforms);

    // Generate captions for each platform
    for (const platform of platforms) {
      const result = await this.generateForPlatform(platform, params);
      results.push(result);
    }

    return results;
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

    // Generate with OpenAI
    const response = await this.openAI.generateCaptionWithStructuredOutput(
      systemPrompt,
      developerPrompt,
      prompt,
      platform,
      params.contentFormat
    );

    return {
      platform,
      variants: response.variants.map((v) => ({
        caption: v.caption,
        hashtags: v.hashtags || [],
        hashtagReason: v.hashtag_explanation,
        storySlides: v.story_slides,
      })),
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

    return `Generate 3 caption variants strictly following the JSON schema below.

Rules:
- Do NOT add extra keys.
- Do NOT remove required keys.
- All strings must be plain text.
- Hashtags must not include punctuation.
- If hashtags are not recommended for the platform, return an empty array and explain why in \`hashtag_explanation\`.
- Platform tone rules:
  - TikTok / Instagram Reels: casual, hook-driven
  - YouTube Shorts: concise, curiosity-based
  - YouTube Long: informative, keyword-rich
  - Instagram Feed: expressive, balanced
  - Facebook: conversational, community-focused
  - LinkedIn: professional, reflective, no emojis unless requested
  - X (Twitter): short, sharp, conversational
  - Pinterest: descriptive, keyword-rich, actionable
  - Snapchat: ultra-casual, immediate

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
      "caption": "string",
      "hashtags": ["string"] ${!needsHashtags ? '// empty array if not recommended' : ''},
      "hashtag_explanation": "string" ${!needsHashtags ? '// required if hashtags empty' : '// optional'},
      "story_slides": ["string"] ${isStory ? '// required for stories, 3-5 slides' : '// omit for non-story'}
    }
  ]
}`;
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
    } = params;

    let prompt = `Platform: ${platform}
Format: ${contentFormat}
Goal: ${goal}
Audience: ${targetAudience}
Tone: ${tone}
Length: ${length}
Hashtag level: ${hashtagLevel}`;

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

    if (brandVoice || niche || emojiPreference !== undefined) {
      prompt += `\n\nBrand voice rules:`;
      if (brandVoice) prompt += `\n- ${brandVoice}`;
      if (niche) prompt += `\n- Niche: ${niche}`;
      if (emojiPreference === false) prompt += `\n- Do not overuse emojis`;
      else if (emojiPreference === true) prompt += `\n- Use emojis appropriately`;
    }

    if (storyEnabled !== undefined) {
      prompt += `\n\nStory enabled: ${storyEnabled}`;
    }

    return prompt;
  }
}
