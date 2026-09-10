import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await prisma.socialInbox.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }))
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const item = await prisma.socialInbox.create({ data: { ownerId: session.user.id, platform: body.platform, sender: body.authorName || body.authorId || 'Unknown', message: body.message } })
  return NextResponse.json(item)
}
