export type AdapterStatus = 'healthy' | 'degraded' | 'unavailable'

export type ProviderHealthResult = {
  status: AdapterStatus
  latencyMs?: number
  message?: string
  checkedAt: Date
}

export type AdapterCapabilities = {
  key: string
  operations: string[]
  supportsAsync: boolean
  supportsStreaming?: boolean
}

export type ExecutionContext = {
  executionId: string
  ownerId?: string
  signal?: AbortSignal
  metadata?: Record<string, unknown>
}

export type AdapterResult<TOutput = unknown> = {
  output: TOutput
  externalId?: string
  usage?: ProviderUsageRecord
}

export type ProviderUsageRecord = {
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  durationMs?: number
  estimatedCost?: number
  currency?: string
}

export interface ProviderAdapter<TInput = unknown, TOutput = unknown> {
  health(): Promise<ProviderHealthResult>
  capabilities(): Promise<AdapterCapabilities>
  execute(input: TInput, context: ExecutionContext): Promise<AdapterResult<TOutput>>
  usage?(result: AdapterResult<TOutput>): ProviderUsageRecord | undefined
}

export type AIProviderAdapter = ProviderAdapter<{
  prompt: string
  model?: string
  structuredOutput?: boolean
}, string>

export type WebsiteBuilderAdapter = ProviderAdapter<{
  projectId?: string
  instruction: string
}, { projectId: string; versionId?: string }>

export type ImageGenerationAdapter = ProviderAdapter<{
  prompt: string
  size?: string
}, { url: string }>

export type VideoGenerationAdapter = ProviderAdapter<{
  prompt: string
}, { url: string }>

export type SocialPlatformAdapter = ProviderAdapter<{
  platform: string
  content: string
  mediaUrl?: string
}, { externalId: string }>

export type EmailProviderAdapter = ProviderAdapter<{
  to: string
  subject: string
  body: string
}, { externalId: string }>

export type WorkflowProviderAdapter = ProviderAdapter<{
  workflowId: string
  input?: unknown
}, { externalId?: string }>

export type SearchProviderAdapter = ProviderAdapter<{
  query: string
}, { items: Array<{ title: string; url: string; snippet?: string }> }>
