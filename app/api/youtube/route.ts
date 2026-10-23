import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const videos = await (prisma as any).youTubeVideo.findMany({
      where: { ownerId: session.user.id },
      include: { assets: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(videos)
  } catch (e: any) {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const topic = String(body.topic ?? '').trim()
  const format = body.format === 'SHORT' ? 'SHORT' : 'LONG'
  const aspectRatio = format === 'SHORT' ? '9:16' : '16:9'

  if (!topic) return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
  const title = body.title || (topic.length > 70 ? `${topic.slice(0, 67)}...` : topic)

  try {
    const video = await (prisma as any).youTubeVideo.create({
      data: {
        topic,
        title,
        ownerId: session.user.id,
        format,
        aspectRatio,
        stage: 'RESEARCH',
        status: 'DRAFT',
        scheduledAt: new Date(Date.now() + 86400000),
        assets: {
          create: [
            { type: 'VOICEOVER', status: 'QUEUED', provider: 'Gemini 3.8 TTS' },
            { type: 'MOTION_VIDEO', status: 'QUEUED', provider: 'Gemini Omni Flash' },
            { type: 'THUMBNAIL', status: 'QUEUED', provider: 'Gemini Nano Banana 2.1' },
          ],
        },
      },
      include: { assets: true },
    })
    return NextResponse.json(video, { status: 201 })
  } catch (error: any) {
    const fallbackVideo = {
      id: `yt_${Date.now()}`,
      topic,
      title,
      format,
      aspectRatio,
      stage: 'RESEARCH',
      status: 'DRAFT',
      ownerId: session.user.id,
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      assets: [],
      createdAt: new Date().toISOString(),
    }
    return NextResponse.json(fallbackVideo, { status: 201 })
  }
}
