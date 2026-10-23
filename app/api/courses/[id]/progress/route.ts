import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const body = await request.json()
  const { lessonId, completed = true, email: requestedEmail } = body

  const email = session?.user?.email || requestedEmail
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
  }

  // Ensure enrollment exists
  let enrollment = await prisma.enrollment.findUnique({
    where: {
      email_courseId: {
        email,
        courseId: params.id,
      },
    },
  })

  if (!enrollment) {
    enrollment = await prisma.enrollment.create({
      data: {
        email,
        courseId: params.id,
      },
    })
  }

  // Upsert progress
  await prisma.progress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId,
      },
    },
    create: {
      enrollmentId: enrollment.id,
      lessonId,
      completed,
    },
    update: {
      completed,
    },
  })

  // Calculate course completion stats
  const totalLessons = await prisma.lesson.count({
    where: { module: { courseId: params.id } },
  })

  const completedLessons = await prisma.progress.count({
    where: {
      enrollmentId: enrollment.id,
      completed: true,
      lesson: { module: { courseId: params.id } },
    },
  })

  const progressPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return NextResponse.json({
    success: true,
    completedLessons,
    totalLessons,
    progressPercentage,
    isComplete: progressPercentage === 100,
  })
}
