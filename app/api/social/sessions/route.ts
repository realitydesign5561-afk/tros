import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  deleteSocialSession,
  listSocialSessions,
  saveManualSocialCredentials,
  saveSocialSession,
  SUPPORTED_PLATFORMS,
} from '@/lib/social-sessions'

export const runtime = 'nodejs'

async function userId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id
}

export async function GET() {
  const id = await userId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sessions = await listSocialSessions(id)
  return NextResponse.json({ platforms: SUPPORTED_PLATFORMS, sessions })
}

export async function POST(request: Request) {
  const id = await userId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const rawPlatform = String(body.platform || '').toLowerCase()
  const platform = rawPlatform === 'x' ? 'twitter' : rawPlatform

  if (!SUPPORTED_PLATFORMS.includes(platform)) {
    return NextResponse.json(
      { error: `Unsupported platform "${body.platform}". Supported: ${SUPPORTED_PLATFORMS.join(', ')}` },
      { status: 400 }
    )
  }

  // Handle manual login credentials (no API connection needed)
  if (body.usernameOrEmail || body.username || body.email) {
    const username = body.usernameOrEmail || body.username || body.email
    await saveManualSocialCredentials(
      id,
      platform,
      username,
      body.password || '',
      body.accountName || username
    )
    return NextResponse.json({
      ok: true,
      mode: 'manual',
      platform,
      accountName: body.accountName || username,
      message: `Account connected for ${platform} via manual login.`,
    })
  }

  // Handle session/storage state if provided
  if (body.storageState) {
    await saveSocialSession(id, platform, body.storageState, body.accountId, body.accountName)
    return NextResponse.json({ ok: true, mode: 'session', platform })
  }

  return NextResponse.json(
    { error: 'Please enter your username/email and password to connect manually.' },
    { status: 400 }
  )
}

export async function DELETE(request: Request) {
  const id = await userId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const platform = new URL(request.url).searchParams.get('platform') || ''
  await deleteSocialSession(id, platform)
  return NextResponse.json({ ok: true, platform, message: 'Account disconnected.' })
}

export async function PATCH(request: Request) {
  const id = await userId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  return NextResponse.json({ ok: true, platform: body.platform, message: 'Account status refreshed' })
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
