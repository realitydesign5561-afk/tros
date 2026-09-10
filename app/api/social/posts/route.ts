import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

async function id() { return (await getServerSession(authOptions))?.user?.id }

export async function GET() {
  const ownerId = await id()
  if (!ownerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await prisma.socialPost.findMany({ where: { ownerId }, orderBy: { scheduledAt: 'asc' } }))
}

export async function POST(request: Request) {
  const ownerId = await id()
  if (!ownerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!body.platform || !body.caption) return NextResponse.json({ error: 'Platform and caption are required' }, { status: 400 })
  const post = await prisma.socialPost.create({ data: { ownerId, platform: body.platform, caption: body.caption, hashtags: body.hashtags || '', scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null, status: body.scheduledAt ? 'SCHEDULED' : 'DRAFT' } })
  return NextResponse.json(post)
}

export const dynamic = 'force-dynamic'
