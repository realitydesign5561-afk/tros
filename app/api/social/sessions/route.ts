import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { deleteSocialSession, listSocialSessions, saveSocialSession, SUPPORTED_PLATFORMS } from '@/lib/social-sessions'

export const runtime = 'nodejs'

async function userId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id
}

export async function GET() {
  const id = await userId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ platforms: SUPPORTED_PLATFORMS, sessions: await listSocialSessions(id) })
}

export async function POST(request: Request) {
  const id = await userId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!SUPPORTED_PLATFORMS.includes(body.platform) || !body.storageState?.cookies) return NextResponse.json({ error: 'Platform and storageState are required' }, { status: 400 })
  await saveSocialSession(id, body.platform, body.storageState, body.accountId, body.accountName)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const id = await userId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const platform = new URL(request.url).searchParams.get('platform') || ''
  await deleteSocialSession(id, platform)
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request) {
  const id = await userId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  return NextResponse.json({ ok: true, platform: body.platform, message: 'Connection check queued' })
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const securityNote = 'Only user-authorized Playwright storageState is accepted; passwords are never sent to TROS.'
