import OpenAI from 'openai';
import { config } from '../config/env';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }

  async generateCaptionWithAI(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert social media caption writer who creates engaging, platform-optimized captions that maximize engagement.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate caption with AI');
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
