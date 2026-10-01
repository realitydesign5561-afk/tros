import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { resolveServerCredential } from '@/lib/ai-gateway/credentials'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const lead = await prisma.lead.findFirst({ where: { id: body.leadId, ownerId: session.user.id } })
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  const subject = `A quick idea for ${lead.company || lead.name}`
  const bodyText = `Hi ${lead.name},\n\nI noticed ${lead.company || 'your team'} may be working through ${lead.painPoints || 'a growth bottleneck'}. I put together a short idea that could help.\n\nWould it be useful to compare notes?`
  const message = await prisma.leadMessage.create({ data: { leadId: lead.id, subject, body: bodyText, sequence: Number(body.sequence || 1), status: 'DRAFT', campaignId: lead.campaignId } })
  const apiKey = process.env.RESEND_API_KEY || (await resolveServerCredential(['resend', 'email', 'Email'], session.user.id))?.value
  if (!apiKey || !lead.email || body.send !== true) return NextResponse.json({ message, delivery: 'DRAFT_ONLY', note: 'Resend requires a configured credential and verified test recipient.' })
  const resend = new Resend(apiKey)
  const recipient = process.env.RESEND_TEST_RECIPIENT || 'delivered@resend.dev'
  const result = await resend.emails.send({ from: 'TROS Sandbox <onboarding@resend.dev>', to: [recipient], subject, text: bodyText }, { idempotencyKey: `lead-outreach/${message.id}` })
  if (result.error) return NextResponse.json({ message, delivery: 'ERROR', error: result.error.message }, { status: 502 })
  const sent = await prisma.leadMessage.update({ where: { id: message.id }, data: { status: 'SENT', sentAt: new Date(), providerId: result.data?.id } })
  return NextResponse.json({ message: sent, delivery: 'SANDBOX_SENT', recipient })
}
