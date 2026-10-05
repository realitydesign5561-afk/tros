import { PrismaClient } from '@prisma/client'
import { executeAITask } from '@/lib/ai-gateway/service'
import { videoAdapterManager } from '../course/VideoService'

const prisma = new PrismaClient()

export class SocialAgent {
  async research(query: string, userId: string = 'system') {
    const aiResponse = await executeAITask({
      task: `Research social media trends for: ${query}`,
      capability: 'TEXT_GENERATION',
      userId
    })
    return aiResponse.output
  }

  async strategy(prompt: string, userId: string = 'system') {
    const system = `You are an expert social-media strategist. Produce a JSON object ONLY with the following keys:
- contentStrategy (string)
- contentPillars (array of strings)
- dailyPosts (array of objects with title, hook, cta, hashtags, imageConcept, videoConcept)
- imageConcepts (array of strings)
- carouselConcepts (array of strings)
- videoConcepts (array of strings)
- postingSchedule (array of ISO dates with times)
Make the output concise and suitable for a 30-day campaign.`

    const aiResponse = await executeAITask({
      task: `${system}\n\nPrompt: ${prompt}`,
      capability: 'TEXT_GENERATION',
      userId
    })

    const raw = aiResponse.output
    try {
      const cleanJson = raw.replace(/^```json\s*/i, '').replace(/```$/g, '').trim()
      return JSON.parse(cleanJson)
  }

  async generatePost(pillar: string, hook: string, userId: string = 'system') {
    const aiResponse = await executeAITask({
      task: `Create a concise social media post (max 280 chars) that aligns with the given pillar and hook.\nPillar: ${pillar}\nHook: ${hook}`,
      capability: 'TEXT_GENERATION',
      userId
    })
    return aiResponse.output
  }

  async generateCaption(context: string, userId: string = 'system') {
    const aiResponse = await executeAITask({
      task: `Write an engaging caption for the following content: ${context}`,
      capability: 'TEXT_GENERATION',
      userId
    })
    return aiResponse.output
  }

  async generateImage(prompt: string, userId: string = 'system') {
    const aiResponse = await executeAITask({
      task: prompt,
      capability: 'IMAGE_GENERATION',
      userId
    })
    let url = ''
    try {
      url = JSON.parse(aiResponse.output).url
    } catch {
      url = aiResponse.output // fallback
    }
    return { imagePrompt: prompt, url }
  }

  async generateCarousel(topic: string, userId: string = 'system') {
    const aiResponse = await executeAITask({
      task: `Provide 5 short carousel slide descriptions for the topic: ${topic}`,
      capability: 'TEXT_GENERATION',
      userId
    })
    return aiResponse.output.split(/\n|\d+\.\s*/).filter(Boolean)
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
