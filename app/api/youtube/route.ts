import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const videos = await prisma.youTubeVideo.findMany({ where: { ownerId: session.user.id }, include: { assets: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(videos)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const topic = String(body.topic ?? '').trim()
  if (!topic) return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
  const title = topic.length > 70 ? `${topic.slice(0, 67)}...` : topic
  const video = await prisma.youTubeVideo.create({ data: { topic, title, ownerId: session.user.id, stage: 'RESEARCH', status: 'DRAFT', assets: { create: [{ type: 'VOICEOVER', status: 'QUEUED', provider: process.env.ELEVENLABS_API_KEY ? 'ElevenLabs' : null }, { type: 'STOCK_VIDEO', status: 'QUEUED', provider: process.env.PEXELS_API_KEY ? 'Pexels' : null }, { type: 'THUMBNAIL', status: 'QUEUED', provider: process.env.REPLICATE_API_TOKEN ? 'Image provider' : null }] } }, include: { assets: true } })
  return NextResponse.json(video, { status: 201 })
}
