import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ActivepiecesConfigError, createWorkflow, isActivepiecesConfigured, updateWorkflow } from '@/lib/activepieces'

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isActivepiecesConfigured()) return NextResponse.json({ error: new ActivepiecesConfigError().message }, { status: 503 })

  const workflow = await prisma.workflow.findFirst({ where: { id: params.id, ownerId: userId } })
  if (!workflow) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  const graph = JSON.parse(workflow.graph) as unknown

  try {
    const result = workflow.activepiecesId
      ? await updateWorkflow(workflow.activepiecesId, { name: workflow.name, graph })
      : await createWorkflow({ name: workflow.name, graph })
    const updated = await prisma.workflow.update({ where: { id: workflow.id }, data: { activepiecesId: result.id, activepiecesStatus: result.status || 'ACTIVE', status: 'ACTIVE' } })
    return NextResponse.json({ workflow: updated, activepieces: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Activepieces activation failed.'
    await prisma.workflowAlert.create({ data: { workflowId: workflow.id, message } })
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
