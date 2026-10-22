import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { callActivepiecesTool } from '@/lib/activepieces'
import { prisma } from '@/lib/prisma'

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

    // Built-in tools handling
    if (toolName === 'tros_notify_admin') {
      const alert = await prisma.analyticsEvent.create({
        data: {
          name: 'admin_notification',
          source: 'ai_agent',
          metadata: JSON.stringify({
            userId: session.user.id,
            title: toolArgs.title,
            message: toolArgs.message,
            severity: toolArgs.severity || 'INFO',
          }),
        },
      })
      return NextResponse.json({ success: true, toolName, result: { delivered: true, eventId: alert.id } })
    }

    if (toolName === 'tros_save_lead') {
      const lead = await prisma.lead.create({
        data: {
          ownerId: session.user.id,
          name: toolArgs.name,
          email: toolArgs.email,
          company: toolArgs.company || 'Unknown',
          niche: toolArgs.niche || 'General',
          score: 80,
          status: 'NEW',
        },
      })
      return NextResponse.json({ success: true, toolName, result: { leadId: lead.id, saved: true } })
    }

    // Activepieces MCP tool execution
    const mcpResult = await callActivepiecesTool(toolName, toolArgs)
    return NextResponse.json({ success: true, toolName, result: mcpResult })
  } catch (err: any) {
    console.error('[Agent tool invocation error]:', err)
    return NextResponse.json({ error: err.message || 'Tool execution failed' }, { status: 502 })
  }
}
