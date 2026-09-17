import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function userId() { return (await getServerSession(authOptions))?.user?.id }

export async function GET() {
  const id = await userId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id }, select: { socialAutomationEnabled: true } })
  return NextResponse.json({ enabled: user?.socialAutomationEnabled ?? false })
}

export async function PATCH(request: Request) {
  const id = await userId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const user = await prisma.user.update({ where: { id }, data: { socialAutomationEnabled: Boolean(body.enabled) }, select: { socialAutomationEnabled: true } })
  return NextResponse.json({ enabled: user.socialAutomationEnabled })
}