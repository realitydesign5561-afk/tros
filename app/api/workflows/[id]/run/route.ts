import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ActivepiecesConfigError, isActivepiecesConfigured, runWorkflow } from '@/lib/activepieces'

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const workflow = await prisma.workflow.findFirst({ where: { id: params.id, ownerId: userId } })
  if (!workflow) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  const connected = await isActivepiecesConfigured(userId)
  if (!connected || !workflow.activepiecesId) return NextResponse.json({ error: new ActivepiecesConfigError().message }, { status: 503 })
  let status = 'RUNNING'
  let logs = 'Workflow dispatched to Activepieces; awaiting provider completion.'
  let externalId: string | undefined
  try {
    const result = await runWorkflow(workflow.activepiecesId, userId)
    externalId = result.id
    if (!externalId) throw new Error('Activepieces did not return a run ID.')
  } catch (error) {
    status = 'FAILED'
    logs = error instanceof Error ? error.message : 'Activepieces run failed.'
  }
  const run = await prisma.workflowRun.create({ data: { workflowId: workflow.id, status, externalId, logs, finishedAt: status === 'FAILED' ? new Date() : null } })
  if (status === 'FAILED') await prisma.workflowAlert.create({ data: { workflowId: workflow.id, message: logs } })
  await prisma.workflow.update({ where: { id: workflow.id }, data: { status: status === 'FAILED' ? 'ERROR' : 'ACTIVE' } })
  return status === 'FAILED' ? NextResponse.json({ run, connected, error: logs }, { status: 502 }) : NextResponse.json({ run, connected })
}
