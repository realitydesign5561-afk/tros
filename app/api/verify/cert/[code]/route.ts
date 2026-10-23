import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _: Request,
  { params }: { params: { code: string } }
) {
  const certificate = await prisma.courseCertificate.findUnique({
    where: { certificateCode: params.code },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          instructorBio: true,
        },
      },
    },
  })

  if (!certificate) {
    return NextResponse.json(
      { error: 'Certificate not found or invalid verification code.' },
      { status: 404 }
    )
  }

  return NextResponse.json(certificate)
}
