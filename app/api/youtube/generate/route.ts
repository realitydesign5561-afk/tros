import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { executeAITask } from '@/lib/ai-gateway/service'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, kind } = await request.json()
  const video = await prisma.youTubeVideo.findFirst({ where: { id, ownerId: session.user.id } })
  if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  const prompt = kind === 'research' ? `Research the YouTube topic "${video.topic}". Return a concise audience angle, five factual talking points, and three title ideas.` : `Write a faceless YouTube script about "${video.topic}". Include a strong hook, clear sections, natural voiceover pacing, and a concise call to action. Return only the script.`
  try {
    const result = await executeAITask({ task: prompt, capability: kind === 'research' ? 'WEB_RESEARCH' : 'TEXT_GENERATION', userId: session.user.id, maxTokens: 1200 })
    const text = typeof result.output === 'string' ? result.output : ''
    const data = kind === 'research' ? { research: text, stage: 'SCRIPT' } : { script: text, stage: 'VOICEOVER' }
    const updated = await prisma.youTubeVideo.update({ where: { id }, data, include: { assets: true } })
    return NextResponse.json({ ...updated, taskId: result.taskId, provider: result.providerName, model: result.model })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Generation failed' }, { status: 502 })
  }
}
