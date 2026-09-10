import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { generateText } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function fallback(topic: string) {
  return { title: `${topic}: Field Guide`, description: `A practical, outcome-driven course about ${topic}.`, modules: [{ title: 'Foundations', lessons: ['The essential mental model', 'Tools and setup'], quiz: 'What is the core principle?', assignment: 'Apply the principle to one real example.' }, { title: 'Practice', lessons: ['A repeatable workflow', 'Common mistakes'], quiz: 'Which step creates the most leverage?', assignment: 'Create a one-week action plan.' }, { title: 'Launch', lessons: ['Measure what matters', 'Build the next iteration'], quiz: 'What should you improve first?', assignment: 'Ship a small, measurable project.' }] }
}

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
  const { topic } = await request.json()
  if (!topic?.trim()) return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
  let outline = fallback(topic.trim())
  if (process.env.AI_GATEWAY_API_KEY) {
    try {
      const result = await generateText({ model: gateway('openai/gpt-4o-mini'), maxOutputTokens: 900, prompt: `Create a course outline for ${topic}. Return JSON only with title, description, modules: [{title, lessons: string[], quiz, assignment}].` })
      outline = JSON.parse(result.text)
    } catch { /* keep useful local outline */ }
  }
  const course = await prisma.course.create({ data: { ownerId: user.id, topic: topic.trim(), title: outline.title, description: outline.description, modules: { create: outline.modules.map((module: { title: string; lessons: string[]; quiz?: string; assignment?: string }, moduleIndex: number) => ({ title: module.title, position: moduleIndex, lessons: { create: module.lessons.map((title, lessonIndex) => ({ title, position: lessonIndex, quiz: module.quiz ? { create: { prompt: module.quiz, answer: 'Review the lesson and explain the principle in your own words.' } } : undefined, assignment: module.assignment ? { create: { prompt: module.assignment } } : undefined })) } })) } }, include: { modules: { include: { lessons: true }, orderBy: { position: 'asc' } } } })
  return NextResponse.json(course, { status: 201 })
}
