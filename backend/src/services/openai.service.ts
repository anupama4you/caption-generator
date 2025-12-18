import OpenAI from 'openai';
import { config } from '../config/env';
import { OpenAICaptionResponse, Platform, ContentFormat } from '../types';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }

  async generateCaptionWithStructuredOutput(
    systemPrompt: string,
    developerPrompt: string,
    userPrompt: string,
    platform: Platform,
    _format: ContentFormat
  ): Promise<OpenAICaptionResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'developer',
            content: developerPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content || '{"variants":[]}';
      const parsed = JSON.parse(content);

      // Validate and ensure we have 3 variants
      if (!parsed.variants || !Array.isArray(parsed.variants)) {
        throw new Error('Invalid response structure');
      }

      // Ensure exactly 3 variants
      while (parsed.variants.length < 3) {
        parsed.variants.push({
          caption: parsed.variants[0]?.caption || 'Caption variant',
          hashtags: parsed.variants[0]?.hashtags || [],
          hashtag_explanation: parsed.variants[0]?.hashtag_explanation,
          story_slides: parsed.variants[0]?.story_slides,
        });
      }

      if (parsed.variants.length > 3) {
        parsed.variants = parsed.variants.slice(0, 3);
      }

      return parsed as OpenAICaptionResponse;
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Return fallback
      return {
        variants: [
          {
            caption: `Error generating caption for ${platform}. Please try again.`,
            hashtags: [],
            hashtag_explanation: 'Generation failed',
          },
          {
            caption: `Error generating caption for ${platform}. Please try again.`,
            hashtags: [],
            hashtag_explanation: 'Generation failed',
          },
          {
            caption: `Error generating caption for ${platform}. Please try again.`,
            hashtags: [],
            hashtag_explanation: 'Generation failed',
          },
        ],
      };
    }
  }

  async scoreKeywordRelevance(
    caption: string,
    niche: string,
    platform: string
  ): Promise<number> {
    try {
      const prompt = `Analyze this social media caption for keyword relevance and SEO quality.

Platform: ${platform}
Niche: ${niche}
Caption: ${caption}

Rate the keyword usage on a scale of 0-100 based on:
1. Relevance to the niche
2. Search-friendly keywords
3. Call-to-action presence
4. Platform-specific best practices

Return ONLY a number between 0-100.`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 10,
      });

      const score = parseInt(response.choices[0].message.content?.trim() || '50');
      return isNaN(score) ? 50 : Math.min(100, Math.max(0, score));
    } catch (error) {
      console.error('Keyword scoring error:', error);
      return 50;
    }
  }

  async predictVirality(
    caption: string,
    hashtags: string[],
    platform: string
  ): Promise<number> {
    try {
      const prompt = `Predict the virality potential of this social media post.

Platform: ${platform}
Caption: ${caption}
Hashtags: ${hashtags.join(', ')}

Rate the virality potential on a scale of 0-100 based on:
1. Emotional appeal
2. Shareability
3. Timeliness/trendiness
4. Hook/attention-grabbing quality

Return ONLY a number between 0-100.`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 10,
      });

      const score = parseInt(response.choices[0].message.content?.trim() || '50');
      return isNaN(score) ? 50 : Math.min(100, Math.max(0, score));
    } catch (error) {
      console.error('Virality prediction error:', error);
      return 50;
    }
  }

  async generateTrendingHashtags(niche: string, platform: string): Promise<any[]> {
    try {
      const prompt = `Generate 20 trending hashtags for ${platform} in the ${niche} niche.

Requirements:
- Include a mix of popular and niche-specific hashtags
- Format as JSON array
- Include estimated trend score (0-100)

Example format:
[
  {"hashtag": "#example", "score": 85, "category": "${niche}"},
  ...
]

Return ONLY the JSON array, no other text.`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content || '[]';
      return JSON.parse(content);
    } catch (error) {
      console.error('Hashtag generation error:', error);
      return [];
    }
  }
}
