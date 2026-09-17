import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPlatformLoginUrl, SUPPORTED_PLATFORMS } from '@/lib/social-sessions'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as { platform?: string }
  const platform = String(body.platform || '').toLowerCase()
  if (!SUPPORTED_PLATFORMS.includes(platform)) return NextResponse.json({ error: 'Unsupported social platform.' }, { status: 400 })
  const configuredUrl = process.env[`SOCIAL_${platform.toUpperCase()}_LOGIN_URL`]
  return NextResponse.json({ platform, loginUrl: configuredUrl || getPlatformLoginUrl(platform), message: 'Sign in on the official platform page, then return to TROS and refresh the connection.' })
}
