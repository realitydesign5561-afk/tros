import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publishScheduledPost } from '@/lib/social-publisher'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')
  if (secret && authorization !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const due = await prisma.socialPost.findMany({ where: { status: 'SCHEDULED', scheduledAt: { lte: new Date() }, owner: { socialAutomationEnabled: true } }, include: { owner: true } })
  const results = await Promise.all(due.map(async (post) => {
    try {
      await publishScheduledPost({ id: post.id, platform: post.platform, caption: post.caption, hashtags: post.hashtags, imageUrl: post.imageUrl })
      await prisma.socialPost.update({ where: { id: post.id }, data: { status: 'PUBLISHED', publishedAt: new Date() } })
      return { id: post.id, status: 'PUBLISHED' }
    } catch (error) {
      await prisma.socialPost.update({ where: { id: post.id }, data: { status: 'FAILED' } })
      return { id: post.id, status: 'FAILED', error: error instanceof Error ? error.message : 'Publishing failed.' }
    }
  }))
  return NextResponse.json({ queued: due.length, published: results.filter(result => result.status === 'PUBLISHED').length, posts: results })
}
