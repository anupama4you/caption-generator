import { CaptionGenerationParams, CaptionResult } from '../types';
import { OpenAIService } from './openai.service';
import { TrendingHashtagService } from './trending.service';

export class CaptionService {
  private openAI: OpenAIService;
  private trendingService: TrendingHashtagService;

  constructor() {
    this.openAI = new OpenAIService();
    this.trendingService = new TrendingHashtagService();
  }

  async generateCaption(params: CaptionGenerationParams): Promise<CaptionResult> {
    const {
      platform,
      contentType,
      contentDescription,
      niche,
      brandVoice,
      targetAudience,
      emojiPreference,
      hashtagCount,
    } = params;

    // Get trending hashtags for context
    const trendingHashtags = await this.trendingService.getTrendingForGeneration(
      platform,
      niche,
      30
    );

    // Build context-aware prompt
    const prompt = this.buildPrompt({
      platform,
      contentType,
      contentDescription,
      niche: niche || 'general',
      brandVoice: brandVoice || 'professional',
      targetAudience: targetAudience || 'general audience',
      emojiPreference: emojiPreference !== false,
      hashtagCount: hashtagCount || 10,
      trendingHashtags: trendingHashtags.map((h) => h.hashtag),
    });

    // Generate caption
    const generatedText = await this.openAI.generateCaptionWithAI(prompt);

    // Parse caption and hashtags
    const { caption, hashtags } = this.parseGeneratedContent(generatedText);

    return {
      caption,
      hashtags,
    };
  }

  private buildPrompt(params: any): string {
    const platformStrategies: Record<string, string[]> = {
      INSTAGRAM: [
        'Open with a hook in the first 125 characters',
        'Keep it conversational and personable',
        'Use a clear CTA (save/share/comment)',
        'Mix branded and trending hashtags; avoid hashtag stuffing in the first line',
      ],
      TIKTOK: [
        'Be concise and playful; lean into trending slang',
        'Mention the hook or payoff early',
        'Add 3-5 highly relevant hashtags, mix broad + niche',
        'Encourage engagement (duet/stitch/comment/like)',
      ],
      FACEBOOK: [
        'Keep it short and value-focused',
        'Ask a direct question to spark comments',
        'Use 1-3 precise hashtags only',
        'Make the CTA explicit (learn more/join/comment)',
      ],
      YOUTUBE: [
        'Write like a strong video title + short description',
        'Front-load keywords for SEO',
        'Include 1-2 punchy CTA lines (watch/subscribe/comment)',
        'Add 5-10 relevant hashtags; avoid keyword stuffing',
      ],
    };

    const strategyList = platformStrategies[params.platform] || [];

    return `Create a high-performance ${params.platform} caption for a ${params.contentType}.

Content Description: ${params.contentDescription}

Context:
- Niche: ${params.niche}
- Brand Voice: ${params.brandVoice}
- Target Audience: ${params.targetAudience}
- Use Emojis: ${params.emojiPreference ? 'Yes' : 'No'}
- Number of Hashtags: ${params.hashtagCount}
- Platform-Specific Strategies:
${strategyList.map((s) => `- ${s}`).join('\n')}

Trending Hashtags to Consider:
${params.trendingHashtags.slice(0, 20).join(', ')}

Requirements:
1. Create a captivating, algorithm-friendly caption optimized for ${params.platform}
2. Match the ${params.brandVoice} tone while keeping it scannable on mobile
3. Include ${params.hashtagCount} highly relevant hashtags; prefer the most trending/targeted
4. Use trending hashtags where appropriate; avoid spammy or banned tags
5. ${params.emojiPreference ? 'Include relevant emojis' : 'Keep emoji use minimal or skip'}
6. Add a clear call-to-action aligned to the platform (save/share/comment/subscribe/duet)
7. Make it engaging for ${params.targetAudience} and optimized for watch/scroll retention
8. Follow the platform-specific strategies above

Format your response as:
CAPTION: [your caption here]
HASHTAGS: #hashtag1 #hashtag2 #hashtag3 ...`;
  }

  private parseGeneratedContent(content: string): { caption: string; hashtags: string[] } {
    const lines = content.split('\n');
    let caption = '';
    let hashtags: string[] = [];

    for (const line of lines) {
      if (line.startsWith('CAPTION:')) {
        caption = line.replace('CAPTION:', '').trim();
      } else if (line.startsWith('HASHTAGS:')) {
        const hashtagLine = line.replace('HASHTAGS:', '').trim();
        hashtags = hashtagLine.split(' ').filter((h) => h.startsWith('#'));
      }
    }

    // Fallback: if parsing failed, try to extract from raw content
    if (!caption) {
      const captionMatch = content.match(/CAPTION:\s*(.+?)(?=HASHTAGS:|$)/s);
      caption = captionMatch ? captionMatch[1].trim() : content;
    }

    if (hashtags.length === 0) {
      const hashtagMatch = content.match(/HASHTAGS:\s*(.+)/);
      if (hashtagMatch) {
        hashtags = hashtagMatch[1].split(' ').filter((h) => h.startsWith('#'));
      }
    }

    return { caption, hashtags };
  }
}
