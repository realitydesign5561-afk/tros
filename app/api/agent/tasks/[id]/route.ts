import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { controlAgentTask } from '@/lib/agent/runtime'

const actionSchema = z.object({
  action: z.string().transform((v) => v.toUpperCase()),
})

async function ownerId() {
  return (await getServerSession(authOptions))?.user?.id
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = await ownerId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const task = await prisma.agentTask.findFirst({
    where: { id: params.id, userId: id },
    include: {
      events: { orderBy: { createdAt: 'asc' } },
    },
  })
  if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 })
  return NextResponse.json({ task })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const id = await ownerId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const body = await request.json().catch(() => ({}))
  const parsed = actionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid task action.' }, { status: 400 })
  
  try {
    const task = await controlAgentTask(params.id, id, parsed.data.action)
    return NextResponse.json({ task })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to update task.' }, { status: 400 })
  }
}
