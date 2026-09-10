import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')
  if (secret && authorization !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const due = await prisma.socialPost.findMany({ where: { status: 'SCHEDULED', scheduledAt: { lte: new Date() } } })
  if (due.length) await prisma.socialPost.updateMany({ where: { id: { in: due.map(post => post.id) } }, data: { status: 'PUBLISHING' } })
  return NextResponse.json({ queued: due.length, posts: due.map(post => ({ id: post.id, platform: post.platform })) })
}
