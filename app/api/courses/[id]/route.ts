import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const course = await prisma.course.findFirst({ where: { id: params.id, owner: { email: session.user.email } }, include: { modules: { include: { lessons: { include: { videos: true, quiz: true, assignment: true }, orderBy: { position: 'asc' } } }, orderBy: { position: 'asc' } }, payments: true } })
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  return NextResponse.json(course)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const lesson = body.lessonId ? await prisma.lesson.update({ where: { id: body.lessonId }, data: { youtubeUrl: body.youtubeUrl, script: body.script, status: body.status ?? 'EDITED' } }) : null
  const course = await prisma.course.update({ where: { id: params.id }, data: { title: body.title, description: body.description } })
  return NextResponse.json({ course, lesson })
}
