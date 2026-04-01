import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class VisionService {
  /**
   * Analyze an image URL and return a rich description suitable for
   * social media caption generation.
   */
  async analyzeImage(imageUrl: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'low' },
            },
            {
              type: 'text',
              text: `Analyze this image and write a concise description (2-4 sentences) optimized for social media caption generation. Include:
- What is happening or being shown
- The mood, tone, and visual style
- Key objects, people, setting, or action
- Any text visible in the image
- The overall vibe or emotion

Be specific and descriptive. Focus on details a social media caption writer would need.`,
            },
          ],
        },
      ],
    });

    return response.choices[0]?.message?.content?.trim() ?? '';
  }
}

export const visionService = new VisionService();
