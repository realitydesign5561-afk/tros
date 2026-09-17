import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function ownerId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const userId = await ownerId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const workflow = await prisma.workflow.findFirst({ where: { id: params.id, ownerId: userId }, include: { alerts: { orderBy: { createdAt: 'desc' }, take: 20 }, runs: { orderBy: { startedAt: 'desc' }, take: 20 } } })
  if (!workflow) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  return NextResponse.json(workflow)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const userId = await ownerId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const input = await request.json() as { name?: string; graph?: unknown; status?: string }
  const existing = await prisma.workflow.findFirst({ where: { id: params.id, ownerId: userId } })
  if (!existing) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  const workflow = await prisma.workflow.update({ where: { id: existing.id }, data: { ...(input.name !== undefined ? { name: input.name.trim() } : {}), ...(input.graph !== undefined ? { graph: JSON.stringify(input.graph) } : {}), ...(input.status !== undefined ? { status: input.status } : {}) } })
  return NextResponse.json(workflow)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const userId = await ownerId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const deleted = await prisma.workflow.deleteMany({ where: { id: params.id, ownerId: userId } })
  if (!deleted.count) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  return NextResponse.json({ deleted: deleted.count })
}
