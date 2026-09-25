import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { controlAgentTask } from '@/lib/agent/runtime'

const actionSchema = z.object({ action: z.enum(['pause', 'resume', 'cancel', 'retry', 'approve']) })

async function ownerId() {
  return (await getServerSession(authOptions))?.user?.id
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = await ownerId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const task = await prisma.agentTask.findFirst({ where: { id: params.id, userId: id }, include: { agent: true, steps: { orderBy: { sequence: 'asc' }, include: { toolCalls: true } }, artifacts: { orderBy: { createdAt: 'asc' } }, errors: { orderBy: { createdAt: 'asc' } }, checkpoints: { orderBy: { createdAt: 'asc' } }, events: { orderBy: { sequence: 'asc' } }, messages: { orderBy: { createdAt: 'asc' } } } })
  if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 })
  return NextResponse.json({ task })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const id = await ownerId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = actionSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid task action.' }, { status: 400 })
  try {
    const task = await controlAgentTask(params.id, id, parsed.data.action)
    return NextResponse.json({ task })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update task.'
    return NextResponse.json({ error: message === 'TASK_NOT_FOUND' ? 'Task not found.' : message }, { status: message === 'TASK_NOT_FOUND' ? 404 : 409 })
  }
}
