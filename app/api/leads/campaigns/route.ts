import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const campaigns = await prisma.leadCampaign.findMany({ where: { ownerId: session.user.id }, include: { leads: true, messages: true }, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ campaigns })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const campaign = await prisma.leadCampaign.create({ data: { name: String(body.name || 'New outreach campaign'), niche: body.niche, location: body.location, ownerId: session.user.id } })
  return NextResponse.json({ campaign })
}
