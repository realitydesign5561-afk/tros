import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const ownerId = (await getServerSession(authOptions))?.user?.id
  if (!ownerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const post = await prisma.socialPost.findFirst({ where: { id: params.id, ownerId }, include: { analytics: true } })
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const ownerId = (await getServerSession(authOptions))?.user?.id
  if (!ownerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const post = await prisma.socialPost.findFirst({ where: { id: params.id, ownerId } })
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  const analytics = await prisma.socialPostAnalytics.upsert({ where: { postId: post.id }, create: { postId: post.id, impressions: Number(body.impressions || 0), likes: Number(body.likes || 0), comments: Number(body.comments || 0), shares: Number(body.shares || 0), clicks: Number(body.clicks || 0) }, update: { impressions: Number(body.impressions || 0), likes: Number(body.likes || 0), comments: Number(body.comments || 0), shares: Number(body.shares || 0), clicks: Number(body.clicks || 0) } })
  return NextResponse.json(analytics)
}