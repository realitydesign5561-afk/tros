import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/ai-gateway/admin'
import { credentialFingerprint, encryptCredential } from '@/lib/ai-gateway/crypto'
import { AI_CAPABILITIES } from '@/lib/ai-gateway/capabilities'

const patchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  kind: z.string().trim().min(2).max(60).optional(),
  baseUrl: z.string().url().optional().or(z.literal('')).nullable().optional(),
  apiKey: z.string().min(1).max(1000).optional(),
  capabilities: z.array(z.enum(AI_CAPABILITIES)).min(1).optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional(),
  priority: z.number().int().min(1).max(10000).optional(),
  fallbackPriority: z.number().int().min(1).max(10000).optional(),
  maxSpend: z.number().nonnegative().nullable().optional(),
  dailyLimit: z.number().nonnegative().nullable().optional(),
  monthlyLimit: z.number().nonnegative().nullable().optional(),
  model: z.object({
    key: z.string().trim().min(1).max(120),
    name: z.string().trim().min(1).max(120).optional(),
    contextWindow: z.number().int().positive().nullable().optional(),
    inputCostPerMillion: z.number().nonnegative().nullable().optional(),
    outputCostPerMillion: z.number().nonnegative().nullable().optional(),
    status: z.enum(['ACTIVE', 'DISABLED']).optional(),
  }).optional(),
})

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const input = patchSchema.parse(await request.json())
    const existing = await prisma.aiProvider.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: 'Provider not found.' }, { status: 404 })
    const encrypted = input.apiKey ? encryptCredential(input.apiKey) : null
    const provider = await prisma.$transaction(async (transaction) => {
      await transaction.aiProvider.update({ where: { id: params.id }, data: { name: input.name, kind: input.kind, baseUrl: input.baseUrl === '' ? null : input.baseUrl, capabilities: input.capabilities, status: input.status, priority: input.priority, fallbackPriority: input.fallbackPriority, maxSpend: input.maxSpend, dailyLimit: input.dailyLimit, monthlyLimit: input.monthlyLimit, ...(input.status === 'ACTIVE' ? { circuitState: 'CLOSED', consecutiveFailures: 0 } : {}) } })
      if (encrypted) await transaction.credential.updateMany({ where: { providerKey: existing.key, status: 'ACTIVE' }, data: { status: 'REVOKED' } })
      if (encrypted) await transaction.credential.create({ data: { providerKey: existing.key, ownerId: null, label: `${input.name || existing.name} API key`, ciphertext: encrypted.ciphertext, keyVersion: encrypted.keyVersion, fingerprint: credentialFingerprint(input.apiKey!) } })
      if (input.model) await transaction.aiModel.upsert({ where: { providerId_key: { providerId: params.id, key: input.model.key } }, create: { providerId: params.id, key: input.model.key, name: input.model.name || input.model.key, capabilities: input.capabilities || existing.capabilities || [], contextWindow: input.model.contextWindow ?? null, inputCostPerMillion: input.model.inputCostPerMillion ?? null, outputCostPerMillion: input.model.outputCostPerMillion ?? null, status: input.model.status || 'ACTIVE' }, update: { name: input.model.name, capabilities: input.capabilities, contextWindow: input.model.contextWindow, inputCostPerMillion: input.model.inputCostPerMillion, outputCostPerMillion: input.model.outputCostPerMillion, status: input.model.status } })
      return transaction.aiProvider.findUnique({ where: { id: params.id }, include: { models: true, healthChecks: { take: 1, orderBy: { checkedAt: 'desc' } } } })
    })
    return NextResponse.json({ provider, credentialUpdated: Boolean(encrypted), apiKey: undefined })
  } catch (error) {
    const isAuth = error instanceof Error && error.message === 'ADMIN_REQUIRED'
    return NextResponse.json({ error: isAuth ? 'Unauthorized' : error instanceof Error ? error.message : 'Unable to update provider.' }, { status: isAuth ? 401 : 400 })
  }
}
