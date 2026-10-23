import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              videos: true,
              quiz: true,
              assignment: true,
            },
            orderBy: { position: 'asc' },
          },
        },
        orderBy: { position: 'asc' },
      },
      payments: true,
      certificates: {
        orderBy: { issuedAt: 'desc' },
      },
      enrollments: session?.user?.email
        ? {
            where: { email: session.user.email },
            include: {
              progresses: true,
            },
          }
        : true,
    },
  })

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  return NextResponse.json(course)
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Update specific lesson if lessonId provided
  let updatedLesson = null
  if (body.lessonId) {
    const lessonData: any = {}
    if (body.youtubeUrl !== undefined) lessonData.youtubeUrl = body.youtubeUrl
    if (body.script !== undefined) lessonData.script = body.script
    if (body.storyboard !== undefined) lessonData.storyboard = typeof body.storyboard === 'string' ? body.storyboard : JSON.stringify(body.storyboard)
    if (body.captions !== undefined) lessonData.captions = body.captions
    if (body.audioUrl !== undefined) lessonData.audioUrl = body.audioUrl
    if (body.videoUrl !== undefined) lessonData.videoUrl = body.videoUrl
    if (body.videoStatus !== undefined) lessonData.videoStatus = body.videoStatus
    if (body.exercises !== undefined) lessonData.exercises = body.exercises
    if (body.examples !== undefined) lessonData.examples = body.examples
    if (body.practicalDemonstrations !== undefined) lessonData.practicalDemonstrations = body.practicalDemonstrations
    if (body.downloadableResources !== undefined) lessonData.downloadableResources = body.downloadableResources
    if (body.completionCriteria !== undefined) lessonData.completionCriteria = body.completionCriteria
    if (body.status !== undefined) lessonData.status = body.status

    updatedLesson = await prisma.lesson.update({
      where: { id: body.lessonId },
      data: lessonData,
    })

    // If quiz update provided
    if (body.quiz && body.quiz.prompt) {
      await prisma.quiz.upsert({
        where: { lessonId: body.lessonId },
        create: {
          lessonId: body.lessonId,
          prompt: body.quiz.prompt,
          answer: body.quiz.answer || 'Option A',
          options: typeof body.quiz.options === 'string' ? body.quiz.options : JSON.stringify(body.quiz.options || []),
          explanation: body.quiz.explanation || '',
        },
        update: {
          prompt: body.quiz.prompt,
          answer: body.quiz.answer,
          options: typeof body.quiz.options === 'string' ? body.quiz.options : JSON.stringify(body.quiz.options || []),
          explanation: body.quiz.explanation,
        },
      })
    }
  }

  // Update course attributes
  const courseData: any = {}
  if (body.title !== undefined) courseData.title = body.title
  if (body.subtitle !== undefined) courseData.subtitle = body.subtitle
  if (body.description !== undefined) courseData.description = body.description
  if (body.price !== undefined) courseData.price = Number(body.price)
  if (body.salesHeadline !== undefined) courseData.salesHeadline = body.salesHeadline
  if (body.salesPitch !== undefined) courseData.salesPitch = body.salesPitch
  if (body.coverImageUrl !== undefined) courseData.coverImageUrl = body.coverImageUrl
  if (body.status !== undefined) courseData.status = body.status

  const updatedCourse = await prisma.course.update({
    where: { id: params.id },
    data: courseData,
  })

  return NextResponse.json({ course: updatedCourse, lesson: updatedLesson })
}
