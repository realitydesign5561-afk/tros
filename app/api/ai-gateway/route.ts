import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getProviderClient } from '@/lib/aiGateway'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const payload = await req.json()
    const { provider, model, messages, stream = false } = payload

    if (!provider || !model || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
    }

    // Fetch API key from DB
    const apiKeyRecord = await prisma.apiKey.findFirst({ where: { provider } })
    if (!apiKeyRecord || !apiKeyRecord.value) {
      return NextResponse.json({ error: `CONFIGURATION_REQUIRED: Provider ${provider} not configured` }, { status: 500 })
    }

    const client = getProviderClient({ name: provider, apiKey: apiKeyRecord.value })
    const start = Date.now()
    const response = await client.generate({ model, messages, stream })
    const durationMs = Date.now() - start

    // Log the request & usage to AnalyticsEvent
    await prisma.analyticsEvent.create({
      data: {
        name: 'ai_gateway_usage',
        source: provider,
        metadata: JSON.stringify({
          userId: session.user.id,
          model,
          requestTokens: client.countTokens ? client.countTokens(messages) : 0,
          responseTokens: client.countTokens ? client.countTokens(response?.choices?.[0]?.message?.content ?? '') : 0,
          latencyMs: durationMs,
          success: true
        })
      }
    })

    return NextResponse.json(response)
  } catch (err: any) {
    // Log failure
    await prisma.analyticsEvent.create({
      data: {
        name: 'ai_gateway_error',
        source: 'gateway',
        metadata: JSON.stringify({
          userId: session?.user?.id,
          errorMessage: err?.message ?? 'Unknown error'
        })
      }
    })
    return NextResponse.json({ error: err?.message ?? 'AI provider error' }, { status: 500 })
  }
}
