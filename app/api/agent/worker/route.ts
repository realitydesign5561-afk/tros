import { NextResponse } from 'next/server'
import { claimNextAgentTask, runAgentTask } from '@/lib/agent/runtime'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const secret = process.env.AGENT_WORKER_SECRET || process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const task = await claimNextAgentTask(process.env.VERCEL_REGION ? `vercel-${process.env.VERCEL_REGION}` : undefined)
  if (!task) return NextResponse.json({ claimed: false, message: 'No queued tasks.' })
  const result = await runAgentTask(task.id, task.lockedBy || undefined, true)
  return NextResponse.json({ claimed: true, taskId: task.id, result })
}

export async function GET(request: Request) {
  return POST(request)
}
