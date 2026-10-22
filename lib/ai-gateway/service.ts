import { prisma } from '@/lib/prisma'
import { executeWithFallback, resolveApiKey, getProviderClient, AICapability } from '@/lib/aiGateway'

export async function providerHealth(id: string) {
  const apiKeyRecord = await prisma.apiKey.findUnique({ where: { id } })
  if (!apiKeyRecord) return { status: 'ERROR', message: 'Provider not found' }

  try {
    const key = await resolveApiKey(apiKeyRecord.provider)
    if (!key) return { status: 'STANDBY', message: 'API key not configured' }

    const client = getProviderClient({ name: apiKeyRecord.provider, apiKey: key })
    const start = Date.now()
    await client.generate({
      model: apiKeyRecord.provider.toLowerCase().includes('openai') ? 'gpt-4o-mini' : 'gemini-3.8-flash',
      messages: [{ role: 'user', content: 'ping' }],
    })
    return { status: 'HEALTHY', latency: Date.now() - start }
  } catch (error: any) {
    return { status: 'ERROR', message: error.message }
  }
}

export async function executeAITask(params: {
  task: string
  capability: string
  userId: string
  preferredProvider?: 'OpenAI' | 'Gemini'
  systemPrompt?: string
}) {
  const cap = (params.capability as AICapability) || 'TEXT_GENERATION'
  const result = await executeWithFallback({
    capability: cap,
    prompt: params.task,
    systemPrompt: params.systemPrompt,
    preferredProvider: params.preferredProvider,
    userId: params.userId,
  })

  // Record usage event
  await prisma.analyticsEvent.create({
    data: {
      name: 'ai_gateway_usage',
      source: result.providerUsed,
      metadata: JSON.stringify({
        userId: params.userId,
        capability: params.capability,
        model: result.modelUsed,
        fallbackOccurred: result.fallbackOccurred,
        fallbackReason: result.fallbackReason,
        tokensUsed: result.tokensUsed,
        estimatedCost: result.estimatedCost,
        latencyMs: result.durationMs,
      }),
    },
  }).catch(() => null)

  return {
    output: result.output,
    providerName: result.providerUsed,
    modelUsed: result.modelUsed,
    fallbackOccurred: result.fallbackOccurred,
    estimatedCost: result.estimatedCost,
  }
}

export async function testAIProvider(id: string) {
  const health = await providerHealth(id)
  return { status: health.status === 'HEALTHY' ? 'SUCCESS' : 'FAILED', message: health.message }
}
