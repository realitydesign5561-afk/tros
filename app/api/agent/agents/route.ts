import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { builtInAgents, discoverTools } from '@/lib/agent/agents'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ agents: builtInAgents.map((agent) => ({ ...agent, tools: discoverTools(agent.module) })) })
}
