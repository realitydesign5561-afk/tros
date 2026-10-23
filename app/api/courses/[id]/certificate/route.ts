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

  const studentName = body.studentName || session?.user?.name || 'Graduating Student'
  const studentEmail = body.studentEmail || session?.user?.email || 'student@tros.demo'
  const grade = Number(body.grade || 98.5)

  // Verify course
  const course = await prisma.course.findUnique({
    where: { id: params.id },
  })

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  // Check if certificate already exists for this email and course
  const existingCert = await prisma.courseCertificate.findFirst({
    where: {
      courseId: params.id,
      studentEmail,
    },
  })

  if (existingCert) {
    return NextResponse.json({
      certificate: existingCert,
      verificationUrl: `/verify/cert/${existingCert.certificateCode}`,
      alreadyIssued: true,
    })
  }

  // Generate unique certificate code
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
  const timeSuffix = Date.now().toString(36).slice(-4).toUpperCase()
  const certificateCode = `TROS-CERT-${timeSuffix}-${randomSuffix}`

  const defaultSkills = [
    'AI Web Design Architecture',
    '8-Point Spatial Grid & Typography',
    'Prompt Engineering for UI',
    'Responsive Flexbox & CSS Grid',
    'WCAG AA Accessibility & Lighthouse 100',
    'Domain Deployment & SSL Edge Routing',
  ]

  const certificate = await prisma.courseCertificate.create({
    data: {
      certificateCode,
      studentName,
      studentEmail,
      courseTitle: course.title,
      grade,
      skills: JSON.stringify(defaultSkills),
      courseId: params.id,
    },
  })

  return NextResponse.json({
    certificate,
    verificationUrl: `/verify/cert/${certificate.certificateCode}`,
    success: true,
  })
}
