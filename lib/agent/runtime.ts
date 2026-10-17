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
  // Event ordering is protected by the compound unique constraint; retrying a
  // sequence collision keeps concurrent status updates from losing history.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const last = await prisma.agentEvent.findFirst({ where: { taskId }, orderBy: { sequence: 'desc' }, select: { sequence: true } })
    try {
      return await prisma.agentEvent.create({ data: { taskId, sequence: (last?.sequence || 0) + 1, type, payload: payload as object | undefined } })
    } catch (error) {
      if (attempt === 2) throw error
    }
  }
  throw new Error('EVENT_APPEND_FAILED')
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
  try {
    const task = await prisma.agentTask.create({ data: { userId: data.userId, module: data.module || 'general', prompt: data.prompt, conversationId: data.conversationId, idempotencyKey: data.idempotencyKey, input: data.projectId ? { projectId: data.projectId } : undefined, steps: { create: { sequence: 1, name: 'accepted' } } } })
    await appendEvent(task.id, 'TASK_QUEUED', { module: task.module })
    return task
  } catch (error) {
    if (data.idempotencyKey) {
      const existing = await prisma.agentTask.findFirst({ where: { userId: data.userId, idempotencyKey: data.idempotencyKey } })
      if (existing) return existing
    }
    throw error
  }
}

export async function submitAgentTaskWorker(data: { taskId: string; workerId?: string }) {
  const task = await prisma.agentTask.findUnique({ where: { id: data.taskId }, select: { id: true, status: true } })
  if (!task) throw new Error('TASK_NOT_FOUND')
  if (task.status !== 'QUEUED') return { success: false, taskId: task.id, reason: 'TASK_NOT_QUEUED' }

  const claimed = await prisma.agentTask.updateMany({
    where: { id: data.taskId, status: 'QUEUED' },
    data: {
      status: 'RUNNING',
      lockedBy: data.workerId || workerId(),
      lockedAt: new Date(),
      startedAt: new Date(),
      attempts: { increment: 1 },
    },
  })
  if (!claimed.count) return { success: false, taskId: data.taskId, reason: 'TASK_ALREADY_CLAIMED' }
  await appendEvent(data.taskId, 'TASK_CLAIMED', { workerId: data.workerId || workerId() })
  return { success: true, taskId: data.taskId }
}

export async function claimNextAgentTask(region?: string) {
  const id = workerId(region)
  const leaseCutoff = new Date(Date.now() - 5 * 60 * 1000)
  const candidate = await prisma.agentTask.findFirst({
    where: {
      OR: [
        { status: 'QUEUED', availableAt: { lte: new Date() } },
        { status: 'RUNNING', lockedAt: { lt: leaseCutoff } },
      ],
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true, status: true },
  })
  if (!candidate) return null
  const claimed = await prisma.agentTask.updateMany({
    where: candidate.status === 'QUEUED'
      ? { id: candidate.id, status: 'QUEUED' }
      : { id: candidate.id, status: 'RUNNING', lockedAt: { lt: leaseCutoff } },
    data: { status: 'RUNNING', lockedBy: id, lockedAt: new Date(), startedAt: new Date(), attempts: { increment: 1 } },
  })
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
  try {
    if (step) await prisma.agentStep.update({ where: { id: step.id }, data: { status: 'RUNNING', input: { prompt: task.prompt, module: task.module }, startedAt: new Date() } })
    await prisma.agentTask.update({ where: { id }, data: { progress: 10, currentStep: step?.name || 'execution' } })
    await prisma.agentCheckpoint.create({ data: { taskId: id, sequence: task.attempts, state: { step: step?.name || 'execution', progress: 10 } } })
    await prisma.agentMessage.create({ data: { taskId: id, role: 'system', content: `Execution started for ${task.module}.` } })
    await appendEvent(id, 'TASK_STARTED', { attempt: task.attempts })

    const current = await prisma.agentTask.findUniqueOrThrow({ where: { id }, select: { status: true, attempts: true } })
    if (current.status === 'CANCELLED' || current.status === 'PAUSED') {
      await prisma.agentTask.update({ where: { id }, data: { lockedBy: null, lockedAt: null } })
      return prisma.agentTask.findUniqueOrThrow({ where: { id } })
    }

    // Module handlers can be added without changing queue, leasing, or persistence.
    // Until a handler is registered, retain the request as a durable execution receipt.
    const output = { status: 'RECEIVED', module: task.module, prompt: task.prompt, attempt: current.attempts }
    await prisma.$transaction(async (tx) => {
      if (step) await tx.agentStep.update({ where: { id: step.id }, data: { status: 'COMPLETED', output, completedAt: new Date() } })
      await tx.agentTask.update({ where: { id }, data: { status: 'COMPLETED', progress: 100, currentStep: null, output, completedAt: new Date(), lockedBy: null, lockedAt: null } })
      await tx.agentArtifact.create({ data: { taskId: id, type: 'execution-receipt', name: `${task.module}-receipt`, metadata: output } })
      await tx.agentMessage.create({ data: { taskId: id, role: 'assistant', content: `Request received for ${task.module}.` } })
    })
    await appendEvent(id, 'TASK_COMPLETED', output)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Task execution failed.'
    const retryable = task.attempts < task.maxAttempts
    await prisma.agentError.create({ data: { taskId: id, code: 'EXECUTION_FAILED', message, retryable } })
    await prisma.agentTask.update({
      where: { id },
      data: retryable
        ? { status: 'QUEUED', error: message, availableAt: new Date(Date.now() + task.attempts * 30_000), lockedBy: null, lockedAt: null }
        : { status: 'FAILED', error: message, completedAt: new Date(), lockedBy: null, lockedAt: null },
    })
    await appendEvent(id, retryable ? 'TASK_REQUEUED' : 'TASK_FAILED', { message, retryable })
  }
  return prisma.agentTask.findUnique({ where: { id } })
}
