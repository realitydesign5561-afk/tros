import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function userId() { return (await getServerSession(authOptions))?.user?.id }

export async function GET() {
  const id = await userId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id }, select: { socialAutomationEnabled: true, socialAutomationNiches: true, socialAutomationDays: true, socialAutomationPostsPerDay: true } })
  return NextResponse.json({ enabled: user?.socialAutomationEnabled ?? false, niches: user?.socialAutomationNiches ?? '', days: user?.socialAutomationDays ?? 'MON,TUE,WED,THU,FRI', postsPerDay: user?.socialAutomationPostsPerDay ?? 1 })
}

export async function PATCH(request: Request) {
  const id = await userId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const postsPerDay = Math.min(10, Math.max(1, Number(body.postsPerDay || 1)))
  const days = Array.isArray(body.days) ? body.days.filter((day: unknown): day is string => ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].includes(String(day))).join(',') : String(body.days || 'MON,TUE,WED,THU,FRI')
  const user = await prisma.user.update({ where: { id }, data: { socialAutomationEnabled: Boolean(body.enabled), socialAutomationNiches: String(body.niches || '').trim() || null, socialAutomationDays: days, socialAutomationPostsPerDay: postsPerDay }, select: { socialAutomationEnabled: true, socialAutomationNiches: true, socialAutomationDays: true, socialAutomationPostsPerDay: true } })
  return NextResponse.json({ enabled: user.socialAutomationEnabled, niches: user.socialAutomationNiches ?? '', days: user.socialAutomationDays ?? '', postsPerDay: user.socialAutomationPostsPerDay })
}