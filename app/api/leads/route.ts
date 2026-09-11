import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const demoLeads = (niche: string, location: string) => [
  ['Northstar Studio', 'hello@northstar.example'],
  ['Cedar & Co.', 'team@cedar.example'],
  ['Lumen Works', 'contact@lumen.example'],
  ['Fieldnote Creative', 'hi@fieldnote.example'],
  ['Signal House', 'hello@signal.example'],
].map(([company, email], index) => ({ name: `Founder ${index + 1}`, company, email, location, niche, source: 'DEMO', painPoints: 'Needs a clearer acquisition system and consistent follow-up.' }))

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const leads = await prisma.lead.findMany({ where: { ownerId: session.user.id }, include: { messages: true }, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ leads })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const niche = String(body.niche || 'creative services')
  const location = String(body.location || 'Remote')
  const leads = await prisma.$transaction(demoLeads(niche, location).map((lead) => prisma.lead.create({ data: { ...lead, ownerId: session.user.id } })))
  return NextResponse.json({ leads })
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const lead = await prisma.lead.updateMany({ where: { id: body.id, ownerId: session.user.id }, data: { status: body.status } })
  return NextResponse.json({ updated: lead.count })
}
