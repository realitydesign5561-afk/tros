import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const task = await prisma.agentTask.findFirst({ where: { id: params.id, userId: session.user.id }, select: { id: true, status: true } })
  if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 })
  const since = Number(new URL(request.url).searchParams.get('since') || 0)
  const events = await prisma.agentEvent.findMany({ where: { taskId: task.id, sequence: { gt: Number.isFinite(since) ? since : 0 } }, orderBy: { sequence: 'asc' }, take: 100 })
  return NextResponse.json({ task, events, lastSequence: events.at(-1)?.sequence || since })
}
