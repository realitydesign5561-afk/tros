import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publishScheduledPost } from '@/lib/social-publisher'
import { generateText } from 'ai'
import { gateway } from '@ai-sdk/gateway'

export const runtime = 'nodejs'

function dayCode(date: Date) {
  return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getUTCDay()]
}

async function createDailyPosts() {
  const now = new Date()
  const code = dayCode(now)
  const users = await prisma.user.findMany({ where: { socialAutomationEnabled: true }, include: { socialSessions: { where: { status: 'ACTIVE' } } } })
  let created = 0
  for (const user of users) {
    const days = (user.socialAutomationDays || 'MON,TUE,WED,THU,FRI').split(',')
    if (!days.includes(code)) continue
    const platforms = user.socialSessions.length ? user.socialSessions.map((session) => session.platform) : ['linkedin']
    const niches = user.socialAutomationNiches || 'useful business systems and practical growth'
    for (let index = 0; index < user.socialAutomationPostsPerDay; index += 1) {
      const platform = platforms[index % platforms.length]
      let caption = `A practical idea for ${niches}: make the next step clear, useful, and easy to test. What has worked for you?`
      if (process.env.AI_GATEWAY_API_KEY) {
        try {
          const result = await generateText({ model: gateway('openai/gpt-4o-mini'), maxOutputTokens: 260, prompt: `Write one original ${platform} post about ${niches}. Give one useful solution, a concrete example, and a genuine question that invites community discussion. Avoid hard selling. Return only the post.` })
          caption = result.text.trim() || caption
        } catch {}
      }
      await prisma.socialPost.create({ data: { ownerId: user.id, platform, caption, hashtags: '#community #growth #practical', status: 'SCHEDULED', scheduledAt: now, analytics: { create: {} } } })
      created += 1
    }
  }
  return created
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')
  if (secret && authorization !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const generated = await createDailyPosts()
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
  return NextResponse.json({ generated, queued: due.length, published: results.filter(result => result.status === 'PUBLISHED').length, posts: results })
}
