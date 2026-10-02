import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/ai-gateway/admin'
import { credentialFingerprint, encryptCredential } from '@/lib/ai-gateway/crypto'
import { AI_CAPABILITIES } from '@/lib/ai-gateway/capabilities'

const providerSchema = z.object({
  key: z.string().trim().min(2).max(80).regex(/^[a-z0-9_-]+$/),
  name: z.string().trim().min(2).max(120),
  kind: z.string().trim().min(2).max(60),
  baseUrl: z.string().url().optional().or(z.literal('')),
  apiKey: z.string().min(1).max(1000),
  capabilities: z.array(z.enum(AI_CAPABILITIES)).min(1),
  priority: z.number().int().min(1).max(10000).default(100),
  fallbackPriority: z.number().int().min(1).max(10000).default(100),
  maxSpend: z.number().nonnegative().nullable().optional(),
  dailyLimit: z.number().nonnegative().nullable().optional(),
  monthlyLimit: z.number().nonnegative().nullable().optional(),
  model: z.object({
    key: z.string().trim().min(1).max(120),
    name: z.string().trim().min(1).max(120).optional(),
    contextWindow: z.number().int().positive().nullable().optional(),
    inputCostPerMillion: z.number().nonnegative().nullable().optional(),
    outputCostPerMillion: z.number().nonnegative().nullable().optional(),
  }).optional(),
})

function publicProvider(provider: any) {
  const health = provider.healthChecks?.[0]
  return {
    id: provider.id,
    key: provider.key,
    name: provider.name,
    kind: provider.kind,
    status: provider.status,
    baseUrl: provider.baseUrl,
    capabilities: provider.capabilities || [],
    priority: provider.priority,
    fallbackPriority: provider.fallbackPriority,
    maxSpend: provider.maxSpend === null ? null : Number(provider.maxSpend),
    dailyLimit: provider.dailyLimit === null ? null : Number(provider.dailyLimit),
    monthlyLimit: provider.monthlyLimit === null ? null : Number(provider.monthlyLimit),
    circuitState: provider.circuitState,
    consecutiveFailures: provider.consecutiveFailures,
    lastSuccessAt: provider.lastSuccessAt,
    lastFailureAt: provider.lastFailureAt,
    quota: provider.quota,
    credentialConfigured: Boolean(provider.credentialFingerprint),
    credentialFingerprint: provider.credentialFingerprint,
    health: health ? { status: health.status, latencyMs: health.latencyMs, errorCode: health.errorCode, message: health.message, checkedAt: health.checkedAt } : null,
    models: provider.models.map((model: any) => ({ id: model.id, key: model.key, name: model.name, capabilities: model.capabilities || [], contextWindow: model.contextWindow, inputCostPerMillion: model.inputCostPerMillion === null ? null : Number(model.inputCostPerMillion), outputCostPerMillion: model.outputCostPerMillion === null ? null : Number(model.outputCostPerMillion), status: model.status })),
  }
}

export async function GET() {
  try {
    await requireAdmin()
    const providers = await prisma.aiProvider.findMany({ include: { models: { orderBy: { key: 'asc' } }, healthChecks: { orderBy: { checkedAt: 'desc' }, take: 1 } }, orderBy: { priority: 'asc' } })
    const fingerprints = await prisma.credential.findMany({ where: { providerKey: { in: providers.map((provider) => provider.key) }, status: 'ACTIVE' }, select: { providerKey: true, fingerprint: true } })
    const fingerprintByKey = new Map(fingerprints.map((item) => [item.providerKey, item.fingerprint]))
    return NextResponse.json(providers.map((provider) => publicProvider({ ...provider, credentialFingerprint: fingerprintByKey.get(provider.key) })))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error && error.message === 'ADMIN_REQUIRED' ? 'Unauthorized' : 'Unable to load AI providers.' }, { status: error instanceof Error && error.message === 'ADMIN_REQUIRED' ? 401 : 500 })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    const parsed = providerSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid provider configuration.', details: parsed.error.flatten() }, { status: 400 })
    const input = parsed.data
    const encrypted = encryptCredential(input.apiKey)
    const provider = await prisma.$transaction(async (transaction) => {
      const created = await transaction.aiProvider.create({ data: { key: input.key, name: input.name, kind: input.kind, baseUrl: input.baseUrl || null, capabilities: input.capabilities, priority: input.priority, fallbackPriority: input.fallbackPriority, maxSpend: input.maxSpend ?? null, dailyLimit: input.dailyLimit ?? null, monthlyLimit: input.monthlyLimit ?? null } })
      await transaction.credential.create({ data: { providerKey: created.key, ownerId: null, label: `${created.name} API key`, ciphertext: encrypted.ciphertext, keyVersion: encrypted.keyVersion, fingerprint: credentialFingerprint(input.apiKey), metadata: { createdBy: admin.id } } })
      if (input.model) await transaction.aiModel.create({ data: { providerId: created.id, key: input.model.key, name: input.model.name || input.model.key, capabilities: input.capabilities, contextWindow: input.model.contextWindow ?? null, inputCostPerMillion: input.model.inputCostPerMillion ?? null, outputCostPerMillion: input.model.outputCostPerMillion ?? null } })
      return transaction.aiProvider.findUnique({ where: { id: created.id }, include: { models: true, healthChecks: { take: 1, orderBy: { checkedAt: 'desc' } } } })
    })
    return NextResponse.json(publicProvider({ ...provider, credentialFingerprint: encrypted.ciphertext ? credentialFingerprint(input.apiKey) : null }), { status: 201 })
  } catch (error) {
    const isAuth = error instanceof Error && error.message === 'ADMIN_REQUIRED'
    return NextResponse.json({ error: isAuth ? 'Unauthorized' : error instanceof Error ? error.message : 'Unable to create provider.' }, { status: isAuth ? 401 : 400 })
  }
}
