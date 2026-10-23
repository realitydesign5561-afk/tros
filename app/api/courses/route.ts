import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateFullCourse, persistFullCourseInDb } from '@/lib/course-studio/pipeline'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const courses = await prisma.course.findMany({
    where: { ownerId: session.user.id },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              quiz: true,
              assignment: true,
            },
            orderBy: { position: 'asc' },
          },
        },
        orderBy: { position: 'asc' },
      },
      enrollments: true,
      certificates: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(courses)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const {
    topic,
    prompt,
    format = 'self-paced',
    audience = 'beginners',
  } = await request.json()

  if (!topic?.trim()) {
    return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
  }

  try {
    // Generate complete 12-stage curriculum, detailed scripts, storyboards, quizzes & sales funnel
    const courseData = await generateFullCourse({
      topic: topic.trim(),
      prompt: prompt || '',
      format,
      audience,
      userId: session.user.id,
    })

    // Persist to Neon PostgreSQL via Prisma
    const course = await persistFullCourseInDb(session.user.id, courseData)

    return NextResponse.json(course, { status: 201 })
  } catch (error: any) {
    console.error('Course generation failed:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate course.' },
      { status: 500 }
    )
  }
}
