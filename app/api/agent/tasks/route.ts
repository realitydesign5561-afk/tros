import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAgentTask } from '@/lib/agent/runtime'

const inputSchema = z.object({ prompt: z.string().trim().min(3).max(20_000), module: z.string().trim().max(80).optional(), projectId: z.string().optional(), conversationId: z.string().optional() })

async function userId() {
  return (await getServerSession(authOptions))?.user?.id
}

export async function GET(request: Request) {
  const id = await userId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(request.url)
  const tasks = await (await import('@/lib/prisma')).prisma.agentTask.findMany({ where: { userId: id, ...(url.searchParams.get('conversationId') ? { conversationId: url.searchParams.get('conversationId')! } : {}) }, orderBy: { createdAt: 'desc' }, take: 50, select: { id: true, module: true, prompt: true, status: true, progress: true, currentStep: true, error: true, output: true, conversationId: true, createdAt: true, completedAt: true } })
  return NextResponse.json({ tasks })
}

export async function POST(request: Request) {
  const id = await userId()
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = inputSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Enter a request with at least three characters.', details: parsed.error.flatten() }, { status: 400 })
  const task = await createAgentTask({ ...parsed.data, userId: id })
  return NextResponse.json({ task }, { status: 202 })
}
