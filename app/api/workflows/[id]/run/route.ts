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
  let status = 'SUCCESS'
  let logs = 'Local run completed. Activepieces is disconnected.'
  let externalId: string | undefined
  try {
    if (workflow.activepiecesId && isActivepiecesConfigured()) {
      const result = await runWorkflow(workflow.activepiecesId)
      externalId = result.id
      logs = 'Run dispatched to Activepieces Cloud.'
      status = 'RUNNING'
    }
  } catch (error) {
    status = 'FAILED'
    logs = error instanceof Error ? error.message : 'Activepieces run failed.'
  }
  if (!isActivepiecesConfigured() && !workflow.activepiecesId) logs = 'Local run completed. Add Activepieces credentials to dispatch cloud runs.'
  const run = await prisma.workflowRun.create({ data: { workflowId: workflow.id, status, externalId, logs, finishedAt: status === 'SUCCESS' || status === 'FAILED' ? new Date() : null } })
  if (status === 'FAILED') await prisma.workflowAlert.create({ data: { workflowId: workflow.id, message: logs } })
  await prisma.workflow.update({ where: { id: workflow.id }, data: { status: status === 'FAILED' ? 'ERROR' : 'ACTIVE' } })
  return NextResponse.json({ run, connected: isActivepiecesConfigured(), warning: isActivepiecesConfigured() ? undefined : new ActivepiecesConfigError().message })
}
