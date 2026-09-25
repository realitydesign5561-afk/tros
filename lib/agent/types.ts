import type { z } from 'zod'

export type AgentToolResult = {
  ok: boolean
  verified: boolean
  data?: unknown
  artifactIds?: string[]
  error?: { code: string; message: string; retryable: boolean }
}

export type AgentToolContext = {
  taskId: string
  userId: string
  projectId?: string
  module: string
  conversationId: string
}

export type AgentTool = {
  key: string
  name: string
  description: string
  modules: string[]
  capabilities: string[]
  permission: string
  requiresApproval: boolean
  input: z.ZodTypeAny
  execute(input: unknown, context: AgentToolContext): Promise<AgentToolResult>
}

export type AgentPlan = {
  intent: string
  module: string
  requirements: string[]
  missingInformation: string[]
  steps: Array<{ name: string; tool: string; input: Record<string, unknown> }>
  expectedOutputs: string[]
  validation: string[]
}
