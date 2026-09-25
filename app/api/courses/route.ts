import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { executeAITask } from '@/lib/ai-gateway/service'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const courses = await prisma.course.findMany({ where: { ownerId: session.user.id }, include: { modules: { include: { lessons: true }, orderBy: { position: 'asc' } } }, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json(courses)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const { topic, prompt, format = 'self-paced', audience = 'beginners', includeVideos = true } = await request.json()
  if (!topic?.trim()) return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
  let outline: { title: string; description: string; modules: { title: string; lessons: string[]; quiz?: string; assignment?: string }[] }
  try {
    const result = await executeAITask({ task: `Create a ${format} course for ${audience} about ${topic}. ${prompt || ''} Return JSON only with title, description, modules: [{title, lessons: string[], quiz, assignment}].`, capability: 'TEXT_GENERATION', userId: session.user.id, maxTokens: 900 })
    outline = JSON.parse(typeof result.output === 'string' ? result.output : '')
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Course generation failed.' }, { status: 502 })
  }
  const course = await prisma.course.create({ data: { ownerId: user.id, topic: topic.trim(), title: outline.title, description: outline.description, modules: { create: outline.modules.map((module: { title: string; lessons: string[]; quiz?: string; assignment?: string }, moduleIndex: number) => ({ title: module.title, position: moduleIndex, lessons: { create: module.lessons.map((title, lessonIndex) => ({ title, position: lessonIndex, youtubeUrl: includeVideos ? `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${topic}`)}` : null, quiz: module.quiz ? { create: { prompt: module.quiz, answer: 'Review the lesson and explain the principle in your own words.' } } : undefined, assignment: module.assignment ? { create: { prompt: module.assignment } } : undefined })) } })) } }, include: { modules: { include: { lessons: true }, orderBy: { position: 'asc' } } } })
  return NextResponse.json(course, { status: 201 })
}
