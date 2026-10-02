import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { discoverTools } from '@/lib/agent/agents'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const agentModule = new URL(request.url).searchParams.get('module') || 'universal'
  return NextResponse.json({ module: agentModule, tools: discoverTools(agentModule) })
}
