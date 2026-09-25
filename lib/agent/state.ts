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
