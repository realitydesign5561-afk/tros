import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const body = await request.json().catch(() => ({}))
  const email = session?.user?.email || body.email

  if (!email) {
    return NextResponse.json(
      { error: 'Email or authentication required to enroll.' },
      { status: 400 }
    )
  }

  // Ensure course exists
  const course = await prisma.course.findUnique({
    where: { id: params.id },
  })

  if (!course) {
    return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
  }

  // Find or create enrollment
  let enrollment = await prisma.enrollment.findUnique({
    where: {
      email_courseId: {
        email,
        courseId: params.id,
      },
    },
    include: {
      progresses: true,
    },
  })

  if (!enrollment) {
    enrollment = await prisma.enrollment.create({
      data: {
        email,
        courseId: params.id,
      },
      include: {
        progresses: true,
      },
    })
  }

  return NextResponse.json({ enrollment, success: true })
}
