import crypto from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { executeAITask } from '@/lib/ai-gateway/service'
import { agentForModule, discoverTools, ensureAgentRegistry } from './agents'
import { getAgentTool, authorizeAgentTool } from './registry'
import { requiresToolReconciliation, resumeAgentStep, staleRecoveryAction } from './state'
import type { AgentPlan, AgentToolResult } from './types'

export const AGENT_STATUSES = ['QUEUED', 'PLANNING', 'RUNNING', 'WAITING_FOR_INPUT', 'VALIDATING', 'REPAIRING', 'COMPLETED', 'FAILED', 'CANCELLED', 'PAUSED'] as const
export type AgentStatus = typeof AGENT_STATUSES[number]

const planSchema = z.object({
  intent: z.string().min(1),
  module: z.string().min(1),
  requirements: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([]),
  steps: z.array(z.object({ name: z.string().min(1), tool: z.string().min(1), input: z.record(z.string(), z.unknown()) })).min(1),
  expectedOutputs: z.array(z.string()).default([]),
  validation: z.array(z.string()).default([]),
})

function decodePlan(text: string): AgentPlan {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  return planSchema.parse(JSON.parse(cleaned))
}

async function emit(taskId: string, type: string, message: string, progress?: number, data?: unknown) {
  const latest = await prisma.agentEvent.aggregate({ where: { taskId }, _max: { sequence: true } })
  return prisma.agentEvent.create({ data: { taskId, sequence: (latest._max.sequence || 0) + 1, type, message, progress, data: data as any } })
}

async function failTask(taskId: string, code: string, message: string, retryable = false, stepId?: string) {
  await prisma.agentError.create({ data: { taskId, stepId, code, message, retryable } })
  await prisma.agentTask.update({ where: { id: taskId }, data: { status: 'FAILED', error: message, completedAt: new Date() } })
  await emit(taskId, 'failed', message, undefined, { code, retryable })
}

export async function createAgentTask(input: { userId: string; projectId?: string; module?: string; prompt: string; conversationId?: string; idempotencyKey?: string }) {
  const agentModule = input.module || 'universal'
  const agent = agentForModule(agentModule)
  await ensureAgentRegistry()
  const conversationId = input.conversationId || crypto.randomUUID()
  const data = { userId: input.userId, projectId: input.projectId, module: agentModule, prompt: input.prompt, conversationId, idempotencyKey: input.idempotencyKey, agent: { connect: { key: agent.key } }, messages: { create: { conversationId, role: 'user', content: input.prompt } } }
  let record
  if (input.idempotencyKey) {
    record = await prisma.agentTask.findUnique({ where: { userId_idempotencyKey: { userId: input.userId, idempotencyKey: input.idempotencyKey } } })
    if (record) return record
    try {
      record = await prisma.agentTask.create({ data })
    } catch (error) {
      if (!(error && typeof error === 'object' && 'code' in error && error.code === 'P2002')) throw error
      const existing = await prisma.agentTask.findUnique({ where: { userId_idempotencyKey: { userId: input.userId, idempotencyKey: input.idempotencyKey } } })
      if (!existing) throw error
      return existing
    }
  } else {
    record = await prisma.agentTask.create({ data })
  }
  await emit(record.id, 'queued', 'Task queued.', 0, { module: agentModule, conversationId })
  return record
}

export async function claimAgentTask(taskId: string, workerId = `worker-${crypto.randomUUID()}`) {
  const staleAt = new Date(Date.now() - 5 * 60_000)
  const claimed = await prisma.agentTask.updateMany({ where: { id: taskId, status: 'QUEUED', OR: [{ lockedAt: null }, { lockedAt: { lt: staleAt } }] }, data: { lockedAt: new Date(), lockedBy: workerId, attempts: { increment: 1 } } })
  return claimed.count === 1 ? prisma.agentTask.findUnique({ where: { id: taskId } }) : null
}

export async function claimNextAgentTask(workerId = `worker-${crypto.randomUUID()}`) {
  await recoverStaleAgentTasks()
  const next = await prisma.agentTask.findFirst({ where: { status: 'QUEUED', availableAt: { lte: new Date() }, OR: [{ lockedAt: null }, { lockedAt: { lt: new Date(Date.now() - 5 * 60_000) } }] }, orderBy: [{ availableAt: 'asc' }, { createdAt: 'asc' }] })
  return next ? claimAgentTask(next.id, workerId) : null
}

export async function recoverStaleAgentTasks(staleAt = new Date(Date.now() - 5 * 60_000)) {
  const staleTasks = await prisma.agentTask.findMany({ where: { status: { in: ['PLANNING', 'RUNNING', 'REPAIRING'] }, lockedAt: { lt: staleAt } }, select: { id: true } })
  let requeued = 0
  let needsReconciliation = 0
  for (const staleTask of staleTasks) {
    const runningSteps = await prisma.agentStep.findMany({ where: { taskId: staleTask.id, status: 'RUNNING' }, select: { id: true } })
    const unsettledToolCall = runningSteps.length
      ? await prisma.agentToolCall.findFirst({ where: { agentTaskId: staleTask.id, stepId: { in: runningSteps.map((step) => step.id) }, status: { in: ['RUNNING', 'SUCCEEDED'] } }, select: { id: true, toolKey: true } })
      : null
    if (staleRecoveryAction(Boolean(unsettledToolCall)) === 'RECONCILE') {
      const message = `Worker lease expired during ${unsettledToolCall?.toolKey || 'a tool call'}; verify whether the external action completed before resuming.`
      const reconciled = await prisma.agentTask.updateMany({ where: { id: staleTask.id, status: { in: ['PLANNING', 'RUNNING', 'REPAIRING'] }, lockedAt: { lt: staleAt } }, data: { status: 'WAITING_FOR_INPUT', currentStep: 'Reconcile interrupted tool call', error: message, lockedAt: null, lockedBy: null } })
      if (!reconciled.count) continue
      await prisma.agentError.create({ data: { taskId: staleTask.id, code: 'TOOL_OUTCOME_UNCERTAIN', message, retryable: false, details: { toolCallId: unsettledToolCall?.id, toolKey: unsettledToolCall?.toolKey } } })
      await emit(staleTask.id, 'reconciliation_required', message, undefined, { toolKey: unsettledToolCall?.toolKey })
      needsReconciliation += 1
      continue
    }
    const requeuedTask = await prisma.agentTask.updateMany({ where: { id: staleTask.id, status: { in: ['PLANNING', 'RUNNING', 'REPAIRING'] }, lockedAt: { lt: staleAt } }, data: { status: 'QUEUED', availableAt: new Date(), currentStep: 'Resuming after worker interruption', lockedAt: null, lockedBy: null } })
    if (requeuedTask.count) {
      await emit(staleTask.id, 'recovered', 'Task requeued after its worker lease expired.', undefined, { previousStatus: 'INTERRUPTED' })
      requeued += 1
    }
  }
  return { requeued, needsReconciliation }
}

async function currentTask(taskId: string) {
  return prisma.agentTask.findUnique({ where: { id: taskId }, include: { agent: true } })
}

async function checkpoint(taskId: string, name: string, state: unknown, stepId?: string) {
  return prisma.agentCheckpoint.create({ data: { taskId, stepId, name, state: state as any } })
}

async function executeStep(taskId: string, aiTaskId: string, stepId: string, toolKey: string, input: unknown, context: { userId: string; projectId?: string; module: string; conversationId: string }, approved: boolean): Promise<AgentToolResult> {
  const tool = getAgentTool(toolKey)
  if (!tool) return { ok: false, verified: false, error: { code: 'TOOL_NOT_FOUND', message: `Tool ${toolKey} is not registered.`, retryable: false } }
  if (tool.requiresApproval && !approved) return { ok: false, verified: false, error: { code: 'APPROVAL_REQUIRED', message: `Approval is required before ${tool.name}.`, retryable: false } }
  if (!(await authorizeAgentTool(context.userId, tool))) return { ok: false, verified: false, error: { code: 'TOOL_PERMISSION_DENIED', message: `Permission denied for ${tool.permission}.`, retryable: false } }
  const parsed = tool.input.safeParse(input)
  if (!parsed.success) return { ok: false, verified: false, error: { code: 'INVALID_TOOL_INPUT', message: parsed.error.message, retryable: false } }
  const call = await prisma.agentToolCall.create({ data: { taskId: aiTaskId, agentTaskId: taskId, stepId, toolKey, status: 'RUNNING', input: parsed.data as any, startedAt: new Date() } })
  const started = Date.now()
  try {
    const result = await tool.execute(parsed.data, { taskId, userId: context.userId, projectId: context.projectId, module: context.module, conversationId: context.conversationId })
    await prisma.agentToolCall.update({ where: { id: call.id }, data: { status: result.ok && result.verified ? 'SUCCEEDED' : 'FAILED', output: result.data as any, errorCode: result.error?.code, errorMessage: result.error?.message, durationMs: Date.now() - started, finishedAt: new Date() } })
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tool execution failed.'
    await prisma.agentToolCall.update({ where: { id: call.id }, data: { status: 'FAILED', errorCode: 'TOOL_EXECUTION_FAILED', errorMessage: message, durationMs: Date.now() - started, finishedAt: new Date() } })
    return { ok: false, verified: false, error: { code: 'TOOL_EXECUTION_FAILED', message, retryable: true } }
  }
}

export async function runAgentTask(taskId: string, workerId?: string, alreadyClaimed = false) {
  const claimed = alreadyClaimed ? await prisma.agentTask.findUnique({ where: { id: taskId } }) : await claimAgentTask(taskId, workerId)
  if (!claimed) return { status: 'NOT_CLAIMED' as const }
  const task = await currentTask(taskId)
  if (!task) return { status: 'NOT_FOUND' as const }
  const agent = task.agent || agentForModule(task.module)
  const leaseOwner = claimed.lockedBy
  const heartbeat = setInterval(() => {
    void prisma.agentTask.updateMany({ where: { id: taskId, lockedBy: leaseOwner, status: { in: ['PLANNING', 'RUNNING', 'REPAIRING'] } }, data: { lockedAt: new Date() } }).catch((error) => console.error('[agent] Lease heartbeat failed:', error))
  }, 20_000)
  heartbeat.unref?.()
  let aiTaskId = ''
  try {
    let plan: AgentPlan
    if (task.plan) {
      plan = planSchema.parse(task.plan)
      const execution = await prisma.aiTask.create({ data: { ownerId: task.userId, type: 'AGENT_RUNTIME_RESUME', input: { agentTaskId: taskId, module: task.module, prompt: task.prompt } } })
      aiTaskId = execution.id
      await emit(taskId, 'resuming', 'Resuming from the saved execution plan and completed checkpoints.', task.progress, { checkpointCount: await prisma.agentCheckpoint.count({ where: { taskId } }) })
    } else {
      await prisma.agentTask.update({ where: { id: taskId }, data: { status: 'PLANNING', startedAt: task.startedAt || new Date(), currentStep: 'Analyzing request' } })
      await emit(taskId, 'planning', 'Analyzing request and creating plan...', 5)
      const tools = discoverTools(task.module)
      const planning = await executeAITask({ userId: task.userId, projectId: task.projectId || undefined, capability: 'REASONING', task: `${agent.systemInstructions}\n\nUser request: ${task.prompt}\n\nAvailable tools: ${JSON.stringify(tools)}\n\nReturn JSON only matching this shape: {intent, module, requirements: string[], missingInformation: string[], steps: [{name, tool, input}], expectedOutputs: string[], validation: string[]}. Choose only available tools. Do not claim execution.`, maxTokens: 1600 })
      aiTaskId = planning.taskId
      plan = decodePlan(typeof planning.output === 'string' ? planning.output : '')
      await prisma.agentTask.update({ where: { id: taskId }, data: { plan: plan as any } })
      await emit(taskId, 'plan_created', 'Execution plan saved.', 15, { plan })
    }
    await prisma.agentTask.update({ where: { id: taskId }, data: { status: plan.missingInformation.length ? 'WAITING_FOR_INPUT' : 'RUNNING', progress: plan.missingInformation.length ? 15 : Math.max(20, task.progress), currentStep: plan.missingInformation.length ? 'Waiting for missing information' : plan.steps[0]?.name } })
    if (!task.plan) await emit(taskId, plan.missingInformation.length ? 'waiting_for_input' : 'plan_created', plan.missingInformation.length ? `Missing information: ${plan.missingInformation.join(', ')}` : 'Execution plan created.', plan.missingInformation.length ? 15 : 20, { plan })
    if (plan.missingInformation.length) {
      await checkpoint(taskId, 'plan-created', { plan, reason: 'missing-information' })
      return { status: 'WAITING_FOR_INPUT' as const, plan }
    }

    const session = await prisma.agentSession.create({ data: { taskId: aiTaskId, agentTaskId: taskId, agentType: agent.key, context: { module: task.module, conversationId: task.conversationId, resumed: Boolean(task.plan) } } })
    const results: unknown[] = []
    for (let index = 0; index < plan.steps.length; index += 1) {
      const fresh = await currentTask(taskId)
      if (!fresh || fresh.status === 'CANCELLED') return { status: 'CANCELLED' as const }
      if (fresh.status === 'PAUSED') { await checkpoint(taskId, 'paused', { step: index }); return { status: 'PAUSED' as const } }
      const planned = plan.steps[index]
      const progress = 20 + Math.floor((index / plan.steps.length) * 70)
      const existingStep = await prisma.agentStep.findUnique({ where: { taskId_sequence: { taskId, sequence: index + 1 } } })
      const resumeDecision = resumeAgentStep(existingStep)
      if (resumeDecision.action === 'SKIP') {
        results.push({ step: planned.name, tool: planned.tool, result: resumeDecision.output })
        continue
      }
      const step = existingStep
        ? await prisma.agentStep.update({ where: { id: existingStep.id }, data: { name: planned.name, status: 'RUNNING', progress, input: planned.input as any, error: null, startedAt: new Date(), completedAt: null } })
        : await prisma.agentStep.create({ data: { taskId, sequence: index + 1, name: planned.name, status: 'RUNNING', progress, input: planned.input as any, startedAt: new Date() } })
      await prisma.agentTask.update({ where: { id: taskId }, data: { currentStep: planned.name, progress } })
      await emit(taskId, 'step_started', `${planned.name}...`, progress, { tool: planned.tool, sequence: index + 1 })
      let result = await executeStep(taskId, aiTaskId, step.id, planned.tool, planned.input, { userId: task.userId, projectId: task.projectId || undefined, module: task.module, conversationId: task.conversationId || '' }, fresh.approvalGranted)
      if (!result.ok && result.error?.code === 'APPROVAL_REQUIRED') {
        await prisma.agentStep.update({ where: { id: step.id }, data: { status: 'WAITING_FOR_INPUT', error: result.error.message } })
        await prisma.agentTask.update({ where: { id: taskId }, data: { status: 'WAITING_FOR_INPUT', currentStep: planned.name } })
        await emit(taskId, 'approval_required', result.error.message, progress, { tool: planned.tool })
        return { status: 'WAITING_FOR_INPUT' as const }
      }
      if (!result.ok && result.error?.retryable) {
        await prisma.agentTask.update({ where: { id: taskId }, data: { status: 'REPAIRING', currentStep: `Repairing ${planned.name}` } })
        await emit(taskId, 'repairing', `Repairing ${planned.name}...`, progress)
        await checkpoint(taskId, 'repair-attempt', { tool: planned.tool, input: planned.input })
        result = await executeStep(taskId, aiTaskId, step.id, planned.tool, planned.input, { userId: task.userId, projectId: task.projectId || undefined, module: task.module, conversationId: task.conversationId || '' }, fresh.approvalGranted)
      }
      if (!result.ok || !result.verified) {
        await prisma.agentStep.update({ where: { id: step.id }, data: { status: 'FAILED', error: result.error?.message || 'Tool result was not verified.', completedAt: new Date() } })
        await failTask(taskId, result.error?.code || 'UNVERIFIED_TOOL_RESULT', result.error?.message || 'Tool result was not verified.', result.error?.retryable, step.id)
        return { status: 'FAILED' as const }
      }
      await prisma.agentStep.update({ where: { id: step.id }, data: { status: 'COMPLETED', progress: 100, output: result.data as any, completedAt: new Date() } })
      await prisma.agentArtifact.create({ data: { taskId, stepId: step.id, type: 'tool-result', name: planned.name, content: result.data as any, verified: true } })
      await checkpoint(taskId, `step-${index + 1}`, { step: planned.name, result: result.data })
      results.push({ step: planned.name, tool: planned.tool, result: result.data })
      await emit(taskId, 'step_completed', `${planned.name} completed.`, progress, { tool: planned.tool, verified: true })
    }

    await prisma.agentTask.update({ where: { id: taskId }, data: { status: 'VALIDATING', progress: 95, currentStep: 'Validating outputs' } })
    await emit(taskId, 'validating', 'Validating outputs...', 95)
    const invalid = results.some((result) => !result)
    if (invalid) { await failTask(taskId, 'OUTPUT_VALIDATION_FAILED', 'One or more tool outputs could not be verified.'); return { status: 'FAILED' as const } }
    await prisma.agentTask.update({ where: { id: taskId }, data: { status: 'COMPLETED', progress: 100, currentStep: 'Completed', completedAt: new Date(), output: { results } as any, lockedAt: null, lockedBy: null } })
    await prisma.agentSession.update({ where: { id: session.id }, data: { status: 'COMPLETED', endedAt: new Date() } })
    await emit(taskId, 'completed', 'Completed.', 100, { verified: true })
    return { status: 'COMPLETED' as const, results }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Agent execution failed.'
    await failTask(taskId, 'AGENT_EXECUTION_FAILED', message, true)
    return { status: 'FAILED' as const }
  } finally {
    clearInterval(heartbeat)
    await prisma.agentTask.updateMany({ where: { id: taskId, status: { notIn: ['QUEUED', 'RUNNING', 'PLANNING', 'REPAIRING'] } }, data: { lockedAt: null, lockedBy: null } })
  }
}

export async function controlAgentTask(taskId: string, userId: string, action: 'pause' | 'resume' | 'cancel' | 'retry' | 'approve' | 'resolve') {
  const task = await prisma.agentTask.findFirst({ where: { id: taskId, userId } })
  if (!task) throw new Error('TASK_NOT_FOUND')
  if (action === 'pause' && ['QUEUED', 'PLANNING', 'RUNNING', 'REPAIRING'].includes(task.status)) return prisma.agentTask.update({ where: { id: taskId }, data: { status: 'PAUSED' } })
  if (action === 'resume' && ['PAUSED', 'WAITING_FOR_INPUT'].includes(task.status) && !requiresToolReconciliation(task.error)) return prisma.agentTask.update({ where: { id: taskId }, data: { status: 'QUEUED', availableAt: new Date(), lockedAt: null, lockedBy: null } })
  if (action === 'approve' && task.status === 'WAITING_FOR_INPUT' && !requiresToolReconciliation(task.error)) return prisma.agentTask.update({ where: { id: taskId }, data: { approvalGranted: true, status: 'QUEUED', availableAt: new Date(), lockedAt: null, lockedBy: null } })
  if (action === 'resolve' && task.status === 'WAITING_FOR_INPUT' && requiresToolReconciliation(task.error)) {
    const unresolvedCalls = await prisma.agentToolCall.findMany({ where: { agentTaskId: taskId, status: 'RUNNING' }, select: { id: true, stepId: true } })
    for (const call of unresolvedCalls) {
      await prisma.agentToolCall.update({ where: { id: call.id }, data: { status: 'RECONCILED_RETRY', errorCode: 'USER_CONFIRMED_RETRY', errorMessage: 'User verified the external action did not complete and approved retry.', finishedAt: new Date() } })
      if (call.stepId) await prisma.agentStep.updateMany({ where: { id: call.stepId, status: 'RUNNING' }, data: { status: 'WAITING_FOR_INPUT', error: 'External action was checked and approved for retry.' } })
    }
    const resumed = await prisma.agentTask.update({ where: { id: taskId }, data: { status: 'QUEUED', error: null, currentStep: 'Continuing after manual reconciliation', availableAt: new Date(), lockedAt: null, lockedBy: null } })
    await emit(taskId, 'tool_reconciled', 'User verified interrupted external actions did not complete and approved retry.', task.progress, { acknowledgedBy: userId, reconciledCallCount: unresolvedCalls.length })
    return resumed
  }
  if (action === 'retry' && task.status === 'FAILED') return prisma.agentTask.update({ where: { id: taskId }, data: { status: 'QUEUED', error: null, completedAt: null, availableAt: new Date(), lockedAt: null, lockedBy: null } })
  if (action === 'cancel' && !['COMPLETED', 'CANCELLED'].includes(task.status)) return prisma.agentTask.update({ where: { id: taskId }, data: { status: 'CANCELLED', completedAt: new Date(), lockedAt: null, lockedBy: null } })
  throw new Error('INVALID_TASK_ACTION')
}
