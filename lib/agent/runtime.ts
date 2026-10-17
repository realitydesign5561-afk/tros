import { prisma } from '@/lib/prisma'

const TERMINAL = new Set(['COMPLETED', 'FAILED', 'CANCELLED'])
const ACTION_STATUS: Record<string, string> = {
  pause: 'PAUSED',
  resume: 'QUEUED',
  cancel: 'CANCELLED',
  retry: 'QUEUED',
  approve: 'QUEUED',
  resolve: 'QUEUED',
}

function workerId(region?: string) {
  return `${region || 'local'}:${process.env.HOSTNAME || 'worker'}`
}

async function appendEvent(taskId: string, type: string, payload?: unknown) {
  const last = await prisma.agentEvent.findFirst({ where: { taskId }, orderBy: { sequence: 'desc' }, select: { sequence: true } })
  return prisma.agentEvent.create({ data: { taskId, sequence: (last?.sequence || 0) + 1, type, payload: payload as object | undefined } })
}

export async function controlAgentTask(id: string, userId: string, action: string) {
  const task = await prisma.agentTask.findFirst({ where: { id, userId } })
  if (!task) throw new Error('TASK_NOT_FOUND')
  if (TERMINAL.has(task.status) && action !== 'retry') throw new Error('TASK_NOT_MUTABLE')
  const status = ACTION_STATUS[action]
  if (!status) throw new Error('INVALID_ACTION')
  const updated = await prisma.agentTask.update({ where: { id }, data: { status, error: action === 'retry' ? null : task.error, availableAt: status === 'QUEUED' ? new Date() : undefined, lockedBy: status === 'QUEUED' ? null : task.lockedBy, lockedAt: status === 'QUEUED' ? null : task.lockedAt } })
  await appendEvent(id, `TASK_${status}`, { action })
  return updated
}

export async function createAgentTask(data: { prompt: string; module?: string; projectId?: string; conversationId?: string; idempotencyKey?: string; userId: string }) {
  if (data.idempotencyKey) {
    const existing = await prisma.agentTask.findFirst({ where: { userId: data.userId, idempotencyKey: data.idempotencyKey } })
    if (existing) return existing
  }
  const task = await prisma.agentTask.create({ data: { userId: data.userId, module: data.module || 'general', prompt: data.prompt, conversationId: data.conversationId, idempotencyKey: data.idempotencyKey, input: data.projectId ? { projectId: data.projectId } : undefined, steps: { create: { sequence: 1, name: 'accepted' } } } })
  await appendEvent(task.id, 'TASK_QUEUED', { module: task.module })
  return task
}

export async function submitAgentTaskWorker(data: { taskId: string; workerId?: string }) {
  const task = await claimNextAgentTask(data.workerId)
  return task ? { success: true, taskId: task.id } : { success: false }
}

export async function claimNextAgentTask(region?: string) {
  const id = workerId(region)
  const candidate = await prisma.agentTask.findFirst({ where: { status: 'QUEUED', availableAt: { lte: new Date() } }, orderBy: { createdAt: 'asc' }, select: { id: true } })
  if (!candidate) return null
  const claimed = await prisma.agentTask.updateMany({ where: { id: candidate.id, status: 'QUEUED' }, data: { status: 'RUNNING', lockedBy: id, lockedAt: new Date(), startedAt: new Date(), attempts: { increment: 1 } } })
  if (!claimed.count) return null
  await appendEvent(candidate.id, 'TASK_CLAIMED', { workerId: id })
  return prisma.agentTask.findUnique({ where: { id: candidate.id } })
}

export async function runAgentTask(id: string, lockedBy?: string, runAsync = false) {
  const task = await prisma.agentTask.findUnique({ where: { id } })
  if (!task) throw new Error('TASK_NOT_FOUND')
  if (task.status !== 'RUNNING' || (lockedBy && task.lockedBy !== lockedBy)) throw new Error('TASK_NOT_CLAIMED')
  if (runAsync) return executeAgentTask(id)
  return executeAgentTask(id)
}

async function executeAgentTask(id: string) {
  const task = await prisma.agentTask.findUniqueOrThrow({ where: { id } })
  const step = await prisma.agentStep.findFirst({ where: { taskId: id }, orderBy: { sequence: 'asc' } })
  if (step) await prisma.agentStep.update({ where: { id: step.id }, data: { status: 'RUNNING', startedAt: new Date() } })
  await prisma.agentTask.update({ where: { id }, data: { progress: 10, currentStep: step?.name || 'execution' } })
  await appendEvent(id, 'TASK_STARTED')
  const output = { accepted: true, module: task.module, message: 'Task accepted by the durable execution plane.' }
  await prisma.$transaction(async (tx) => {
    if (step) await tx.agentStep.update({ where: { id: step.id }, data: { status: 'COMPLETED', output, completedAt: new Date() } })
    await tx.agentTask.update({ where: { id }, data: { status: 'COMPLETED', progress: 100, currentStep: null, output, completedAt: new Date(), lockedBy: null, lockedAt: null } })
  })
  await appendEvent(id, 'TASK_COMPLETED', output)
  return prisma.agentTask.findUnique({ where: { id } })
}
