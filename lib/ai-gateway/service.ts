import { prisma } from '@/lib/prisma'
import { getProviderClient } from '@/lib/aiGateway'

export async function providerHealth(id: string) {
  // Try to find the API key in the DB
  const apiKeyRecord = await prisma.apiKey.findUnique({ where: { id } })
  if (!apiKeyRecord) return { status: 'ERROR', message: 'Provider not found' }

  try {
    const client = getProviderClient({ name: apiKeyRecord.provider, apiKey: apiKeyRecord.value })
    // Simple test to see if it responds
    const start = Date.now()
    await client.generate({ model: apiKeyRecord.provider === 'OpenAI' ? 'gpt-4o-mini' : 'gemini-1.5-flash', messages: [{ role: 'user', content: 'hello' }] })
    return { status: 'HEALTHY', latency: Date.now() - start }
  } catch (error: any) {
    return { status: 'ERROR', message: error.message }
  }
}

export async function executeAITask(params: { task: string; capability: string; userId: string; maxTokens?: number }) {
  // Pick the correct provider based on capability
  let providerName = ''
  
  if (params.capability === 'IMAGE_GENERATION') {
    providerName = 'Midjourney' // Or Replicate, depending on what the user wants. We'll default to OpenAI/Midjourney
  } else if (params.capability === 'TEXT_GENERATION' || params.capability === 'CODE_GENERATION') {
    providerName = 'OpenAI'
  }

  let apiKeyRecord = await prisma.apiKey.findFirst({ where: { provider: providerName } })
  
  // Fallback to Gemini if OpenAI is not available for text
  if (!apiKeyRecord && params.capability === 'TEXT_GENERATION') {
    apiKeyRecord = await prisma.apiKey.findFirst({ where: { provider: 'Gemini' } })
  }

  if (!apiKeyRecord) {
    throw new Error(`CONFIGURATION_REQUIRED: No API key found for capability ${params.capability}`)
  }

  const client = getProviderClient({ name: apiKeyRecord.provider, apiKey: apiKeyRecord.value })
  
  const start = Date.now()
  let output = ''

  if (params.capability === 'IMAGE_GENERATION') {
    const response = await client.generateImage({ prompt: params.task })
    output = JSON.stringify({ url: response.url })
  } else {
    const response = await client.generate({
      model: apiKeyRecord.provider === 'OpenAI' ? 'gpt-4o' : 'gemini-1.5-pro',
      messages: [{ role: 'user', content: params.task }]
    })
    output = response.choices?.[0]?.message?.content || ''
  }
  
  const durationMs = Date.now() - start

  // Log usage
  await prisma.analyticsEvent.create({
    data: {
      name: 'ai_gateway_usage',
      source: apiKeyRecord.provider,
      metadata: JSON.stringify({
        userId: params.userId,
        capability: params.capability,
        requestTokens: client.countTokens ? client.countTokens([{ role: 'user', content: params.task }]) : 0,
        responseTokens: client.countTokens ? client.countTokens(output) : 0,
        latencyMs: durationMs,
        success: true
      })
    }
  })

  return { output, providerName: apiKeyRecord.provider, taskId: 'real' }
}

export async function testAIProvider(id: string) { 
  const health = await providerHealth(id)
  return { status: health.status === 'HEALTHY' ? 'SUCCESS' : 'FAILED', message: health.message }
}
