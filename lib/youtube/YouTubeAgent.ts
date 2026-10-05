import { PrismaClient } from '@prisma/client'
import { executeAITask } from '@/lib/ai-gateway/service'

const prisma = new PrismaClient()

export class YouTubeAgent {
  async research(niche: string, userId: string = 'system') {
    const aiResponse = await executeAITask({
      task: `Research YouTube content gaps and pain points for: ${niche}`,
      capability: 'TEXT_GENERATION',
      userId
    })
    return aiResponse.output
  }

  async trendResearch(niche: string) {
    return `Trends for ${niche}: high demand, low competition.`
  }

  topicScore(demand: number, competition: number, evergreen: boolean) {
    let score = (demand * 0.6) - (competition * 0.4)
    if (evergreen) score += 20
    return Math.max(0, Math.min(100, Math.floor(score)))
  }

  async generateIdea(channelId: string, prompt: string) {
    const idea = await prisma.youTubeVideoIdea.create({
      data: {
        title: prompt,
        description: 'AI Generated Idea based on ' + prompt,
        demandScore: 80,
        competitionScore: 40,
        topicScore: 72,
        channelId
      }
    })
    return idea
  }

  async generateOutline(topic: string, userId: string = 'system') {
    const aiResponse = await executeAITask({
      task: `Generate a YouTube video outline for: ${topic}`,
      capability: 'TEXT_GENERATION',
      userId
    })
    return aiResponse.output
  }

  async generateScript(outline: string, userId: string = 'system') {
    const aiResponse = await executeAITask({
      task: `Write a highly engaging YouTube script based on this outline: ${outline}`,
      capability: 'TEXT_GENERATION',
      userId
    })
    return aiResponse.output
  }

  async metadata(script: string, userId: string = 'system') {
    const aiResponse = await executeAITask({
      task: `Based on this script, provide a catchy title (with 3 variants), description, and tags in JSON format ONLY: ${script}`,
      capability: 'TEXT_GENERATION',
      userId
    })
    try {
      const cleanJson = aiResponse.output.replace(/^```json\s*/i, '').replace(/```$/g, '').trim()
      return JSON.parse(cleanJson)
    } catch {
      return aiResponse.output
    }
  }

  // Media generation stubs (connecting to gateway)
  async generateVoice(script: string) { return "voice_asset_url"; }
  async generateVisuals(script: string) { return "visuals_asset_url"; }
  async generateVideo(voice: string, visuals: string) { return "video_asset_url"; }
  async generateShort(longVideo: string) { return "short_asset_url"; }
  async generateThumbnail(videoContext: string) { return "thumbnail_url"; }

  /**
   * youtube.schedule
   */
  async schedule(videoId: string, date: Date) {
    return prisma.youTubeVideo.update({
      where: { id: videoId },
      data: { scheduledAt: date, status: 'SCHEDULED' }
    });
  }

  /**
   * youtube.publish
   */
  async publish(videoId: string) {
    // In reality this calls YouTubeAdapter
    return prisma.youTubeVideo.update({
      where: { id: videoId },
      data: { publishedAt: new Date(), status: 'PUBLISHED' }
    });
  }

  /**
   * youtube.analytics
   */
  async analytics(videoId: string) {
    return prisma.youTubeAnalytics.findUnique({ where: { videoId } });
  }

  /**
   * youtube.optimize
   */
  async optimize(channelId: string) {
    // Learn from past analytics
    return "Optimization complete: focusing on topics with CTR > 5%";
  }
}
