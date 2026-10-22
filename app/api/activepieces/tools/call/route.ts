import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { callActivepiecesTool } from '@/lib/activepieces'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { toolName, arguments: toolArgs = {} } = await request.json()

    if (!toolName) {
      return NextResponse.json({ error: 'toolName is required' }, { status: 400 })
    }

    const result = await callActivepiecesTool(toolName, toolArgs)
    return NextResponse.json({ success: true, toolName, result })
  } catch (error: any) {
    console.error('[Activepieces MCP tool call error]:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to execute tool via Activepieces MCP' },
      { status: 502 }
    )
  }
}
