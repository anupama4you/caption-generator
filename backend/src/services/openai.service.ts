import OpenAI from "openai";
import { config } from "../config/env";
import { OpenAICaptionResponse, Platform, ContentFormat } from "../types";

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
    _format: ContentFormat,
    userProfile?: {
      toneOfVoice?: string;
      includeQuestions?: boolean;
      ctaStyle?: string;
      avoidClickbait?: boolean;
      formalityLevel?: string;
      emojiPreference?: boolean;
    }
  ): Promise<OpenAICaptionResponse> {
    try {
      const platformGuidance = this.getPlatformGuidelines(platform);
      const formatGuidance = this.getFormatGuidelines(_format);

      // Build user preferences guidance
      let userPreferences = '';
      if (userProfile) {
        const prefs = [];

        if (userProfile.toneOfVoice) {
          prefs.push(`Tone: ${userProfile.toneOfVoice}`);
        }

        if (userProfile.formalityLevel) {
          const formalityMap: Record<string, string> = {
            'formal': 'Use formal, professional language. Avoid contractions and slang.',
            'balanced': 'Mix professional and conversational language appropriately.',
            'casual': 'Use casual, conversational language. Contractions and friendly tone are welcome.'
          };
          prefs.push(formalityMap[userProfile.formalityLevel] || '');
        }

        if (userProfile.emojiPreference !== undefined) {
          prefs.push(userProfile.emojiPreference
            ? 'Use emojis appropriately when they enhance the message'
            : 'Avoid using emojis or use them very sparingly');
        }

        if (userProfile.includeQuestions !== undefined) {
          prefs.push(userProfile.includeQuestions
            ? 'Include engaging questions to boost interaction'
            : 'Avoid using questions in the caption');
        }

        if (userProfile.ctaStyle) {
          const ctaMap: Record<string, string> = {
            'strong': 'Use direct, action-oriented CTAs (e.g., "Click the link!", "Buy now!", "Sign up today!")',
            'moderate': 'Use subtle, friendly CTAs (e.g., "Check it out", "Learn more", "See our story")',
            'none': 'Do not include any call-to-action'
          };
          prefs.push(ctaMap[userProfile.ctaStyle] || '');
        }

        if (userProfile.avoidClickbait) {
          prefs.push('Avoid clickbait, sensational language, or exaggerated claims. Be authentic and straightforward.');
        }

        if (prefs.length > 0) {
          userPreferences = `\n\nUser Style Preferences:\n${prefs.filter(Boolean).map(p => `- ${p}`).join('\n')}`;
        }
      }

      const enrichedDeveloperPrompt = `${developerPrompt}

Variant diversity:
- Provide 3 clearly distinct variants: one short, one medium, one long (all within platform limits).
- Change the opening hook, CTA wording, and hashtag mix in each variant.
- Avoid repeating sentences or identical hashtag sets across variants.

Platform alignment:
- Target platform: ${platform}
- ${platformGuidance}

Format alignment:
- Target format: ${_format}
- ${formatGuidance}${userPreferences}

Non-negotiable rules:
- Do not mix platform norms (e.g., avoid LinkedIn tone on TikTok).
- Respect character and hashtag norms for the platform above.
- Match the caption to the content format so the CTA and structure make sense.
- Follow all user style preferences exactly as specified above.`;

      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "developer",
            content: enrichedDeveloperPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.78,
        max_tokens: 900,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content || '{"variants":[]}';
      const parsed = JSON.parse(content);

      // Validate and ensure we have 3 variants
      if (!parsed.variants || !Array.isArray(parsed.variants)) {
        throw new Error("Invalid response structure");
      }

      // Ensure exactly 3 variants
      while (parsed.variants.length < 3) {
        parsed.variants.push({
          caption: parsed.variants[0]?.caption || "Caption variant",
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
      console.error("OpenAI API error:", error);
      // Return fallback
      return {
        variants: [
          {
            caption: `Error generating caption for ${platform}. Please try again.`,
            hashtags: [],
            hashtag_explanation: "Generation failed",
          },
          {
            caption: `Error generating caption for ${platform}. Please try again.`,
            hashtags: [],
            hashtag_explanation: "Generation failed",
          },
          {
            caption: `Error generating caption for ${platform}. Please try again.`,
            hashtags: [],
            hashtag_explanation: "Generation failed",
          },
        ],
      };
    }
  }

  async generateCaptionsBatched(
    systemPrompt: string,
    userPrompt: string,
    platforms: Platform[],
    format: ContentFormat,
    urlInstructions: Partial<Record<string, string>>,
    userProfile?: {
      toneOfVoice?: string;
      includeQuestions?: boolean;
      ctaStyle?: string;
      avoidClickbait?: boolean;
      formalityLevel?: string;
      emojiPreference?: boolean;
    }
  ): Promise<Partial<Record<string, OpenAICaptionResponse>>> {
    try {
      // Build user preferences section (same logic as single-platform method)
      let userPreferences = '';
      if (userProfile) {
        const prefs: string[] = [];
        if (userProfile.toneOfVoice) prefs.push(`Tone: ${userProfile.toneOfVoice}`);
        if (userProfile.formalityLevel) {
          const formalityMap: Record<string, string> = {
            formal: 'Use formal, professional language. Avoid contractions and slang.',
            balanced: 'Mix professional and conversational language appropriately.',
            casual: 'Use casual, conversational language. Contractions and friendly tone are welcome.',
          };
          prefs.push(formalityMap[userProfile.formalityLevel] || '');
        }
        if (userProfile.emojiPreference !== undefined)
          prefs.push(userProfile.emojiPreference ? 'Use emojis appropriately' : 'Avoid emojis or use very sparingly');
        if (userProfile.includeQuestions !== undefined)
          prefs.push(userProfile.includeQuestions ? 'Include engaging questions to boost interaction' : 'Avoid using questions in the caption');
        if (userProfile.ctaStyle) {
          const ctaMap: Record<string, string> = {
            strong: 'Use direct, action-oriented CTAs (e.g., "Click the link!", "Buy now!")',
            moderate: 'Use subtle, friendly CTAs (e.g., "Check it out", "Learn more")',
            none: 'Do not include any call-to-action',
          };
          prefs.push(ctaMap[userProfile.ctaStyle] || '');
        }
        if (userProfile.avoidClickbait) prefs.push('Avoid clickbait, sensational language, or exaggerated claims.');
        if (prefs.filter(Boolean).length > 0)
          userPreferences = `\n\nUser Style Preferences:\n${prefs.filter(Boolean).map(p => `- ${p}`).join('\n')}`;
      }

      // Build per-platform rules block
      const isStory = format === 'story';
      const formatGuidance = this.getFormatGuidelines(format);

      const platformRulesBlock = platforms.map(p => {
        const guideline = this.getPlatformGuidelines(p);
        const needsHashtags = this.batchPlatformNeedsHashtags(p, format);
        const hashtagRule = needsHashtags ? this.getHashtagGuideline(p) : 'No hashtags — return empty array';
        const urlNote = urlInstructions[p] ? `\n  ↳ Link: ${urlInstructions[p]}` : '';
        return `[${p.toUpperCase()}]\n  Caption: ${guideline}\n  Hashtags: ${hashtagRule}${urlNote}`;
      }).join('\n\n');

      const isYouTubePlatform = (p: Platform) => p === 'youtube_shorts' || p === 'youtube_long';
      const schemaExample = platforms.map(p => {
        const yt = isYouTubePlatform(p);
        return `    "${p}": { "variants": [{ "caption": "string"${yt ? ', "title": "string", "description": "string"' : ''}${isStory ? ', "story_slides": ["string"]' : ''}, "hashtags": ["string"], "hashtag_explanation": "string" }] }`;
      }).join(',\n');

      const developerPrompt = `Generate 3 caption variants for EACH of these platforms in a single response: ${platforms.join(', ')}

VARIANT LENGTH RULES (apply to every platform):
- Variant 1 (SHORT): ~10-15 words. Punchy hook only.
- Variant 2 (MEDIUM): 2-4 lines (~20-40 words). Balanced.
- Variant 3 (LONG): 5+ lines (~50-100 words). Full storytelling.

Variant diversity per platform:
- Different opening hook, CTA wording, and hashtag mix across the 3 variants.
- No repeated sentences or identical hashtag sets within the same platform.

Format: ${format}
${formatGuidance}${isStory ? '\nStory slides: 3-5 slides, max 8 words per slide.' : ''}

PER-PLATFORM RULES:
${platformRulesBlock}${userPreferences}

Non-negotiable rules:
- Do NOT mix platform norms.
- Follow user style preferences exactly.
- Respect character and hashtag counts per platform above.

Return ONLY valid JSON:
{
  "platforms": {
${schemaExample}
  }
}`;

      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "developer", content: developerPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.78,
        max_tokens: Math.min(600 * platforms.length + 500, 8000),
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content || '{"platforms":{}}';
      const parsed = JSON.parse(content);
      const result: Partial<Record<string, OpenAICaptionResponse>> = {};

      for (const platform of platforms) {
        const data = parsed.platforms?.[platform];
        if (data && Array.isArray(data.variants) && data.variants.length > 0) {
          while (data.variants.length < 3) data.variants.push({ ...data.variants[0] });
          result[platform] = { variants: data.variants.slice(0, 3) };
        } else {
          result[platform] = {
            variants: [
              { caption: `Caption for ${platform}. Please try again.`, hashtags: [] },
              { caption: `Caption for ${platform}. Please try again.`, hashtags: [] },
              { caption: `Caption for ${platform}. Please try again.`, hashtags: [] },
            ],
          };
        }
      }

      return result;
    } catch (error) {
      console.error("Batched OpenAI API error:", error);
      const fallback: Partial<Record<string, OpenAICaptionResponse>> = {};
      for (const p of platforms) {
        fallback[p] = {
          variants: [
            { caption: `Error generating caption for ${p}. Please try again.`, hashtags: [] },
            { caption: `Error generating caption for ${p}. Please try again.`, hashtags: [] },
            { caption: `Error generating caption for ${p}. Please try again.`, hashtags: [] },
          ],
        };
      }
      return fallback;
    }
  }

  private batchPlatformNeedsHashtags(platform: Platform, format: ContentFormat): boolean {
    if (format === 'story') return false;
    if (platform === 'snapchat') return false;
    return true;
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
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 10,
      });

      const score = parseInt(
        response.choices[0].message.content?.trim() || "50"
      );
      return isNaN(score) ? 50 : Math.min(100, Math.max(0, score));
    } catch (error) {
      console.error("Keyword scoring error:", error);
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
Hashtags: ${hashtags.join(", ")}

Rate the virality potential on a scale of 0-100 based on:
1. Emotional appeal
2. Shareability
3. Timeliness/trendiness
4. Hook/attention-grabbing quality

Return ONLY a number between 0-100.`;

      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 10,
      });

      const score = parseInt(
        response.choices[0].message.content?.trim() || "50"
      );
      return isNaN(score) ? 50 : Math.min(100, Math.max(0, score));
    } catch (error) {
      console.error("Virality prediction error:", error);
      return 50;
    }
  }

  async generateTrendingHashtags(
    niche: string,
    platform: string
  ): Promise<any[]> {
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
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content || "[]";
      return JSON.parse(content);
    } catch (error) {
      console.error("Hashtag generation error:", error);
      return [];
    }
  }

  private getPlatformGuidelines(platform: Platform): string {
    const rules: Record<Platform, string> = {
      instagram:
        "Blend hook + CTA, emojis allowed, avoid links, keep 12-22 hashtags relevant and not spammy.",
      tiktok:
        "Keep copy playful and concise with a strong hook; invite action (comment/duet); 3-5 sharp hashtags.",
      youtube_shorts:
        "Lead with curiosity, invite watching to the end, include 2-6 concise hashtags, keep copy punchy.",
      youtube_long:
        "Use SEO keywords early, preview value, include subscribe/like CTA, use 5-12 clear hashtags.",
      facebook:
        "Conversational, community-first tone, ask a question, 1-3 hashtags max, links allowed.",
      linkedin:
        "Professional and reflective; no slang; emojis only if user requested; 3-5 industry hashtags.",
      x:
        "Stay under 280 characters, 1-2 sentences plus CTA, 2-4 sharp hashtags, keep it conversational.",
      pinterest:
        "Describe the visual and benefit, keyword-rich, CTA to save/click, 4-8 discovery-focused hashtags.",
      snapchat:
        "Ultra-short and immediate; call to action like “swipe up”; hashtags usually omitted.",
      all:
        "Default to platform-neutral best practices with concise, actionable copy.",
    };

    return (
      rules[platform] ??
      "Follow platform-appropriate tone, CTA, and hashtag norms."
    );
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

  private getFormatGuidelines(format: ContentFormat): string {
    const rules: Record<ContentFormat, string> = {
      short_video:
        "Open with a hook in the first line; reference the visual or audio cue; drive a quick CTA to watch/engage.",
      long_video:
        "Provide a clear summary and value promise; add a subscribe/like CTA; keep hashtags focused on topic.",
      image:
        "Use vivid description of the visual; keep copy skimmable; CTA should fit static post behavior.",
      carousel:
        "Tease progression across slides, hint at key steps, and use a save/share CTA; avoid long paragraphs.",
      story:
        "Keep each slide under ~8 words; 3-5 slides; suggest interactive stickers where natural; no hashtags needed.",
      text_only:
        "Rely on copy to carry the message; add a direct CTA; keep formatting tight without visual references.",
    };

    return (
      rules[format] ??
      "Match the caption structure and CTA to the content format chosen."
    );
  }
}
