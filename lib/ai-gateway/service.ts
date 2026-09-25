import { prisma } from '@/lib/prisma'
import { decryptCredential } from './crypto'
import { normalizeCapabilities, type AiCapability } from './capabilities'
import { classifyProviderError, defaultRetryPolicy, isRetryableProviderError, ProviderExecutionError, selectProviders, type RoutingProvider } from './router'

export type ExecuteAITaskInput = {
  task: string
  capability: AiCapability
  userId?: string
  projectId?: string
  preferredProvider?: string
  preferredModel?: string
  fallbackPolicy?: { maxAttempts?: number; baseDelayMs?: number }
  maxTokens?: number
  imageSize?: string
}

export type ExecuteAITaskResult = {
  taskId: string
  output: string | { url: string }
  providerId: string
  providerName: string
  model: string
  usage: { inputTokens?: number; outputTokens?: number; totalTokens?: number; durationMs: number }
  estimatedCost: number
}

type ProviderRecord = Awaited<ReturnType<typeof loadProviders>>[number]

type ProviderResponse = {
  output: string | { url: string }
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  quota?: Record<string, number>
}

async function loadProviders(preferredProvider?: string) {
  const providers = await prisma.aiProvider.findMany({
    where: { status: 'ACTIVE', ...(preferredProvider ? { id: preferredProvider } : {}) },
    include: { models: { where: { status: 'ACTIVE' }, orderBy: { key: 'asc' } }, healthChecks: { orderBy: { checkedAt: 'desc' }, take: 1 } },
    orderBy: { priority: 'asc' },
  })
  const now = new Date()
  return Promise.all(providers.map(async (provider) => {
    const dayStart = new Date(now)
    dayStart.setUTCHours(0, 0, 0, 0)
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const [daily, monthly, total] = await Promise.all([
      prisma.providerCost.aggregate({ _sum: { amount: true }, where: { providerId: provider.id, recordedAt: { gte: dayStart } } }),
      prisma.providerCost.aggregate({ _sum: { amount: true }, where: { providerId: provider.id, recordedAt: { gte: monthStart } } }),
      prisma.providerCost.aggregate({ _sum: { amount: true }, where: { providerId: provider.id } }),
    ])
    const health = provider.healthChecks[0]
    const candidate: RoutingProvider = {
      id: provider.id,
      priority: provider.priority,
      fallbackPriority: provider.fallbackPriority,
      status: health?.status === 'UNAVAILABLE' ? 'UNAVAILABLE' : provider.status,
      circuitState: provider.circuitState,
      circuitOpenedAt: provider.circuitOpenedAt,
      capabilities: normalizeCapabilities(provider.capabilities),
      dailyLimit: provider.dailyLimit === null ? null : Number(provider.dailyLimit),
      monthlyLimit: provider.monthlyLimit === null ? null : Number(provider.monthlyLimit),
      maxSpend: provider.maxSpend === null ? null : Number(provider.maxSpend),
      dailySpend: Number(daily._sum.amount || 0),
      monthlySpend: Number(monthly._sum.amount || 0),
      totalSpend: Number(total._sum.amount || 0),
      consecutiveFailures: provider.consecutiveFailures,
      lastSuccessAt: provider.lastSuccessAt,
    }
    return { ...provider, candidate }
  }))
}

function providerBaseUrl(provider: ProviderRecord) {
  return (provider.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '')
}

async function providerRequest(provider: ProviderRecord, model: string, input: ExecuteAITaskInput, apiKey: string): Promise<ProviderResponse> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45_000)
  try {
    const isImage = input.capability === 'IMAGE_GENERATION' || input.capability === 'IMAGE_EDITING'
    const endpoint = isImage ? `${providerBaseUrl(provider)}/images/generations` : `${providerBaseUrl(provider)}/chat/completions`
    const body = isImage
      ? { model, prompt: input.task, size: input.imageSize || '1024x1024', n: 1 }
      : { model, messages: [{ role: 'user', content: input.task }], max_tokens: input.maxTokens || 1200 }
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    }).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') throw new ProviderExecutionError(408, 'Provider request timed out.')
      throw error
    })
    const payload = await response.json().catch(() => ({})) as Record<string, any>
    if (!response.ok) throw new ProviderExecutionError(response.status, String(payload.error?.message || `Provider request failed with status ${response.status}.`))
    const quota = Object.fromEntries([
      ['requests', response.headers.get('x-ratelimit-remaining-requests')],
      ['tokens', response.headers.get('x-ratelimit-remaining-tokens')],
      ['resetSeconds', response.headers.get('x-ratelimit-reset-requests')],
    ].filter((entry): entry is [string, string] => Boolean(entry[1])).map(([key, value]) => [key, Number(value)]))
    if (isImage) {
      const url = payload.data?.[0]?.url
      if (!url) throw new ProviderExecutionError(undefined, 'Provider returned no image URL.')
      return { output: { url }, totalTokens: payload.usage?.total_tokens, quota }
    }
    const output = payload.choices?.[0]?.message?.content
    if (typeof output !== 'string') throw new ProviderExecutionError(undefined, 'Provider returned no text output.')
    return { output, inputTokens: payload.usage?.prompt_tokens, outputTokens: payload.usage?.completion_tokens, totalTokens: payload.usage?.total_tokens, quota }
  } finally {
    clearTimeout(timeout)
  }
}

async function recordFailure(provider: ProviderRecord, error: unknown) {
  const now = new Date()
  const nextFailures = provider.consecutiveFailures + 1
  const circuitState = nextFailures >= 3 ? 'OPEN' : 'CLOSED'
  const category = classifyProviderError(error)
  await prisma.$transaction([
    prisma.providerHealth.create({ data: { providerId: provider.id, status: circuitState === 'OPEN' ? 'UNAVAILABLE' : 'DEGRADED', errorCode: category, message: error instanceof Error ? error.message : 'Provider execution failed.' } }),
    prisma.aiProvider.update({ where: { id: provider.id }, data: { consecutiveFailures: nextFailures, circuitState, circuitOpenedAt: circuitState === 'OPEN' ? now : provider.circuitOpenedAt, lastFailureAt: now } }),
  ])
}

async function recordSuccess(provider: ProviderRecord, latencyMs: number, quota?: Record<string, number>) {
  await prisma.$transaction([
    prisma.providerHealth.create({ data: { providerId: provider.id, status: 'HEALTHY', latencyMs } }),
    prisma.aiProvider.update({ where: { id: provider.id }, data: { consecutiveFailures: 0, circuitState: 'CLOSED', circuitOpenedAt: null, lastSuccessAt: new Date(), ...(quota && Object.keys(quota).length ? { quota } : {}) } }),
  ])
}

export async function executeAITask(input: ExecuteAITaskInput): Promise<ExecuteAITaskResult> {
  const task = await prisma.aiTask.create({ data: { ownerId: input.userId, type: input.capability, input: { prompt: input.task, capability: input.capability, projectId: input.projectId } } })
  await prisma.aiTask.update({ where: { id: task.id }, data: { status: 'RUNNING', startedAt: new Date() } })
  const providers = await loadProviders(input.preferredProvider)
  const decisions = selectProviders(providers.map((provider) => provider.candidate), input.capability)
  const policy = { ...defaultRetryPolicy, ...input.fallbackPolicy }
  let sequence = 0
  let lastError: unknown = new Error('No compatible AI provider is configured.')

  for (const decision of decisions) {
    const provider = providers.find((item) => item.id === decision.provider.id)
    if (!provider) continue
    const model = provider.models.find((item) => item.key === input.preferredModel) || provider.models[0]
    if (!model) {
      lastError = new Error(`Provider ${provider.name} has no active model configured.`)
      continue
    }
    const credential = await prisma.credential.findFirst({ where: { providerKey: provider.key, status: 'ACTIVE', OR: [{ ownerId: input.userId }, { ownerId: null }] }, orderBy: { ownerId: 'desc' } })
    if (!credential) {
      lastError = new ProviderExecutionError(401, `No credential is configured for provider ${provider.name}.`)
      await recordFailure(provider, lastError)
      continue
    }
    let apiKey: string
    try { apiKey = decryptCredential(credential.ciphertext) } catch (error) {
      lastError = error
      await recordFailure(provider, error)
      continue
    }

    for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
      sequence += 1
      const step = await prisma.aiTaskStep.create({ data: { taskId: task.id, sequence, name: provider.name, kind: 'PROVIDER_ATTEMPT', status: 'RUNNING', input: { providerId: provider.id, model: model.key, attempt } } })
      const started = Date.now()
      try {
        const result = await providerRequest(provider, model.key, input, apiKey)
        const durationMs = Date.now() - started
        const inputTokens = result.inputTokens || 0
        const outputTokens = result.outputTokens || 0
        const estimatedCost = ((inputTokens * Number(model.inputCostPerMillion || 0)) + (outputTokens * Number(model.outputCostPerMillion || 0))) / 1_000_000
        await prisma.$transaction([
          prisma.aiTaskStep.update({ where: { id: step.id }, data: { status: 'SUCCEEDED', output: result.output, finishedAt: new Date() } }),
          prisma.aiTask.update({ where: { id: task.id }, data: { status: 'SUCCEEDED', result: result.output, modelId: model.id, finishedAt: new Date(), attempts: sequence } }),
          prisma.providerUsage.create({ data: { providerId: provider.id, modelId: model.id, taskId: task.id, inputTokens, outputTokens, totalTokens: result.totalTokens || inputTokens + outputTokens, durationMs, status: 'SUCCEEDED' } }),
          prisma.providerCost.create({ data: { providerId: provider.id, modelId: model.id, taskId: task.id, amount: estimatedCost, basis: { inputTokens, outputTokens } } }),
          prisma.executionLog.create({ data: { taskId: task.id, sequence, level: 'INFO', event: 'provider_succeeded', message: `${provider.name} completed ${input.capability}.`, data: { providerId: provider.id, model: model.key, durationMs } } }),
        ])
        await recordSuccess(provider, durationMs, result.quota)
        await prisma.credential.update({ where: { id: credential.id }, data: { lastUsedAt: new Date() } })
        return { taskId: task.id, output: result.output, providerId: provider.id, providerName: provider.name, model: model.key, usage: { inputTokens, outputTokens, totalTokens: result.totalTokens, durationMs }, estimatedCost }
      } catch (error) {
        lastError = error
        const category = classifyProviderError(error)
        await prisma.$transaction([
          prisma.aiTaskStep.update({ where: { id: step.id }, data: { status: 'FAILED', errorCode: category, errorMessage: error instanceof Error ? error.message : 'Provider execution failed.', finishedAt: new Date(), attempts: attempt } }),
          prisma.providerUsage.create({ data: { providerId: provider.id, modelId: model.id, taskId: task.id, durationMs: Date.now() - started, status: 'FAILED', metadata: { errorCode: category } } }),
          prisma.executionLog.create({ data: { taskId: task.id, sequence, level: 'ERROR', event: 'provider_failed', message: error instanceof Error ? error.message : 'Provider execution failed.', data: { providerId: provider.id, model: model.key, errorCode: category, attempt } } }),
        ])
        await recordFailure(provider, error)
        if (!isRetryableProviderError(error) || attempt === policy.maxAttempts) break
        await new Promise((resolve) => setTimeout(resolve, policy.baseDelayMs * attempt))
      }
    }
  }

  const errorCode = classifyProviderError(lastError)
  await prisma.aiTask.update({ where: { id: task.id }, data: { status: 'FAILED', errorCode, errorMessage: lastError instanceof Error ? lastError.message : 'All AI providers failed.', finishedAt: new Date(), attempts: sequence } })
  throw new Error(`${errorCode}: ${lastError instanceof Error ? lastError.message : 'All compatible providers are unavailable.'}`)
}

export async function testAIProvider(providerId: string, capability: AiCapability = 'TEXT_GENERATION', preferredModel?: string, userId?: string) {
  const result = await executeAITask({ task: 'Respond with exactly: TROS_PROVIDER_OK', capability, preferredProvider: providerId, preferredModel, userId, fallbackPolicy: { maxAttempts: 1 } })
  return result
}

export async function providerHealth(providerId: string) {
  return prisma.providerHealth.findMany({ where: { providerId }, orderBy: { checkedAt: 'desc' }, take: 20 })
}
