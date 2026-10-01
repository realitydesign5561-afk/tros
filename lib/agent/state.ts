import type { AgentStatus } from './runtime'

const transitions: Record<AgentStatus, readonly AgentStatus[]> = {
  QUEUED: ['PLANNING', 'CANCELLED'],
  PLANNING: ['RUNNING', 'WAITING_FOR_INPUT', 'FAILED', 'PAUSED', 'CANCELLED'],
  RUNNING: ['VALIDATING', 'WAITING_FOR_INPUT', 'REPAIRING', 'FAILED', 'PAUSED', 'CANCELLED'],
  WAITING_FOR_INPUT: ['QUEUED', 'CANCELLED'],
  VALIDATING: ['COMPLETED', 'REPAIRING', 'FAILED', 'CANCELLED'],
  REPAIRING: ['RUNNING', 'WAITING_FOR_INPUT', 'FAILED', 'PAUSED', 'CANCELLED'],
  COMPLETED: [],
  FAILED: ['QUEUED', 'CANCELLED'],
  CANCELLED: [],
  PAUSED: ['QUEUED', 'CANCELLED'],
}

export function canTransitionAgent(from: AgentStatus, to: AgentStatus) {
  return transitions[from].includes(to)
}

export function transitionAgent(from: AgentStatus, to: AgentStatus): AgentStatus {
  if (!canTransitionAgent(from, to)) throw new Error(`Invalid agent transition: ${from} -> ${to}`)
  return to
}

export function staleRecoveryAction(hasUnsettledToolCall: boolean): 'REQUEUE' | 'RECONCILE' {
  return hasUnsettledToolCall ? 'RECONCILE' : 'REQUEUE'
}

export function requiresToolReconciliation(error: string | null | undefined) {
  return Boolean(error?.startsWith('Worker lease expired during '))
}

export function resumeAgentStep<T>(checkpoint?: { status: string; output: T | null } | null) {
  return checkpoint?.status === 'COMPLETED'
    ? { action: 'SKIP' as const, output: checkpoint.output }
    : { action: 'EXECUTE' as const }
}
