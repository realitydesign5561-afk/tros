import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { generateText } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, kind } = await request.json()
  const video = await prisma.youTubeVideo.findFirst({ where: { id, ownerId: session.user.id } })
  if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  if (!process.env.AI_GATEWAY_API_KEY) return NextResponse.json({ error: 'AI Gateway is not configured' }, { status: 503 })
  const prompt = kind === 'research' ? `Research the YouTube topic "${video.topic}". Return a concise audience angle, five factual talking points, and three title ideas.` : `Write a faceless YouTube script about "${video.topic}". Include a strong hook, clear sections, natural voiceover pacing, and a concise call to action. Return only the script.`
  try {
    const result = await generateText({ model: gateway('openai/gpt-4o-mini'), prompt })
    const data = kind === 'research' ? { research: result.text, stage: 'SCRIPT' } : { script: result.text, stage: 'VOICEOVER' }
    const updated = await prisma.youTubeVideo.update({ where: { id }, data, include: { assets: true } })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Generation failed' }, { status: 502 })
  }
}
