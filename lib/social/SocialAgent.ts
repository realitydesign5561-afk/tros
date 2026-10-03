import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai'; // Assuming openai SDK is installed
import { videoAdapterManager } from './VideoService';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * SocialAgent – orchestrates all social‑media AI tools.
 * Each method returns structured data that can be stored in the DB and later used by the Scheduler / UI.
 */
export class SocialAgent {
  /**
   * Perform research (trend analysis, audience insights).
   */
  async research(query: string) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Research social media trends for: ${query}` }],
    });
    return completion.choices[0].message?.content ?? '';
  }

  /**
   * Generate a content strategy (pillars, schedule, hashtags, etc.).
   */
  async strategy(prompt: string) {
    const system = `You are an expert social‑media strategist. Produce a JSON object with the following keys:\n- contentStrategy (string)\n- contentPillars (array of strings)\n- dailyPosts (array of objects with title, hook, CTA, hashtags)\n- imageConcepts (array of strings)\n- carouselConcepts (array of strings)\n- videoConcepts (array of strings)\n- postingSchedule (array of ISO dates with times)\nMake the output concise and suitable for a 30‑day campaign.`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
    });
    const raw = completion.choices[0].message?.content ?? '';
    try {
      return JSON.parse(raw);
    } catch {
      // fallback – return raw text
      return { rawStrategy: raw };
    }
  }

  /**
   * Generate a single post based on a pillar and hook.
   */
  async generatePost(pillar: string, hook: string) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Create a concise social media post (max 280 chars) that aligns with the given pillar and hook.' },
        { role: 'user', content: `Pillar: ${pillar}\nHook: ${hook}` },
      ],
    });
    return completion.choices[0].message?.content ?? '';
  }

  /**
   * Generate a caption for an image/video.
   */
  async generateCaption(context: string) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Write an engaging caption for the following content: ${context}` }],
    });
    return completion.choices[0].message?.content ?? '';
  }

  /**
   * Generate an image using the visual pipeline (placeholder – just stores the prompt).
   */
  async generateImage(prompt: string) {
    // In a real system this would call DALL·E or Stable Diffusion.
    // Here we simply store the prompt; the VisualPipeline will later turn it into an asset.
    return { imagePrompt: prompt };
  }

  /**
   * Generate a carousel concept – returns an array of slide prompts.
   */
  async generateCarousel(topic: string) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Provide 5 short carousel slide descriptions for the topic: ${topic}` }],
    });
    const text = completion.choices[0].message?.content ?? '';
    // Split by newlines or numbers
    return text.split(/\n|\d+\.\s*/).filter(Boolean);
  }

  /**
   * Find reference assets (images, videos) via web search – stubbed.
   */
  async findReference(query: string) {
    // Could integrate with Bing Image Search or Unsplash API.
    return [{ url: `https://example.com/placeholder/${encodeURIComponent(query)}` }];
  }

  /**
   * Edit an existing visual asset – stubbed.
   */
  async editAsset(assetId: string, edits: any) {
    // In a real flow we'd invoke an image‑editing service.
    return { assetId, status: 'edited', edits };
  }

  /**
   * Schedule a post – creates a SocialPost with status SCHEDULED.
   */
  async schedule(postData: any, scheduledAt: Date) {
    const post = await prisma.socialPost.create({
      data: {
        ...postData,
        status: 'SCHEDULED',
        scheduledAt,
      },
    });
    return post;
  }

  /**
   * Publish a post via the appropriate platform adapter.
   */
  async publish(postId: string) {
    const post = await prisma.socialPost.findUnique({ where: { id: postId }, include: { platformVariations: true } });
    if (!post) throw new Error('Post not found');
    // For demo we only support TwitterAdapter (can be extended).
    const { TwitterAdapter } = await import('./adapters/TwitterAdapter');
    const adapter = new TwitterAdapter();
    const externalId = await adapter.publish(post);
    await prisma.socialPost.update({
      where: { id: postId },
      data: { status: 'PUBLISHED', externalPostId: externalId, publishedAt: new Date() },
    });
    return externalId;
  }

  /**
   * Retrieve analytics – stubbed.
   */
  async analytics(postId: string) {
    // Would normally call platform APIs.
    return { impressions: 0, clicks: 0, engagement: 0 };
  }

  /**
   * Inbox – fetch direct messages / comments – stubbed.
   */
  async inbox(platform: string) {
    // Placeholder for platform‑specific inbox retrieval.
    return [];
  }

  /**
   * Full campaign generation – orchestrates strategy + posts + assets.
   */
  async generateCampaign(prompt: string, userId: string) {
    const strat = await this.strategy(prompt);
    // Persist campaign metadata
    const campaign = await prisma.socialCampaign.create({
      data: {
        title: prompt.slice(0, 50),
        description: prompt,
        ownerId: userId,
        status: 'DRAFT',
      },
    });

    // Iterate over dailyPosts (assuming strategy returns that field)
    if (Array.isArray(strat.dailyPosts)) {
      for (let i = 0; i < strat.dailyPosts.length; i++) {
        const dp: any = strat.dailyPosts[i];
        const post = await prisma.socialPost.create({
          data: {
            title: dp.title ?? `Day ${i + 1}`,
            hook: dp.hook,
            cta: dp.cta,
            hashtags: dp.hashtags?.join(' ') ?? '',
            caption: dp.caption ?? '',
            platformVariations: dp.platformVariations ?? [],
            campaignId: campaign.id,
            status: 'DRAFT',
          },
        });
        // Optionally generate image/video assets now (stubbed)
        if (dp.imageConcept) {
          await this.generateImage(dp.imageConcept);
        }
        if (dp.videoConcept) {
          // In a full implementation we'd kick off video generation via VideoService.
          await videoAdapterManager.generateWithFallback(dp.videoConcept);
        }
      }
    }
    return campaign;
  }
}
