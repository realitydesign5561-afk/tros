import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { initiateActivepiecesOAuth } from '@/lib/activepieces'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const clientRedirectUri = searchParams.get('redirect_uri')

  // Resolve base URL securely
  let baseUrl = clientRedirectUri
  if (!baseUrl) {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
    const proto = request.headers.get('x-forwarded-proto') || 'https'
    baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || `${proto}://${host}`
  }

  const redirectUri = clientRedirectUri || `${baseUrl.replace(/\/$/, '')}/api/activepieces/oauth/callback`

  try {
    const { authorizationUrl, state } = await initiateActivepiecesOAuth(redirectUri)
    return NextResponse.json({ authorizationUrl, state, redirectUri })
  } catch (err: any) {
    console.error('[Activepieces OAuth start error]:', err)
    return NextResponse.json({ error: err.message || 'Failed to initialize OAuth' }, { status: 500 })
  }
}
