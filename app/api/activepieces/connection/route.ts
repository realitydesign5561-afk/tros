import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getActivepiecesConnectionStatus,
  saveActivepiecesToken,
  clearActivepiecesConnection,
  getActivepiecesMcpUrl,
} from '@/lib/activepieces'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = await getActivepiecesConnectionStatus()
  return NextResponse.json(status)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { accessToken, refreshToken, serverUrl } = body

    if (!accessToken?.trim()) {
      return NextResponse.json({ error: 'Access token is required.' }, { status: 400 })
    }

    await saveActivepiecesToken({
      accessToken: accessToken.trim(),
      refreshToken: refreshToken?.trim() || undefined,
      serverUrl: serverUrl?.trim() || getActivepiecesMcpUrl(),
      connectedAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
    })

    const status = await getActivepiecesConnectionStatus()
    return NextResponse.json({ success: true, status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save Activepieces connection.' }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await clearActivepiecesConnection()
  return NextResponse.json({ success: true, message: 'Activepieces MCP connection cleared.' })
}
