import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { listActivepiecesTools, getActivepiecesConnectionStatus } from '@/lib/activepieces'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const connection = await getActivepiecesConnectionStatus()
  if (!connection.connected) {
    return NextResponse.json({
      connected: false,
      tools: [],
      error: connection.error || 'Activepieces MCP is not connected.',
    })
  }

  const tools = await listActivepiecesTools()
  return NextResponse.json({
    connected: true,
    tools,
    serverUrl: connection.serverUrl,
  })
}
