import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/ai-gateway/admin'
import { prisma } from '@/lib/prisma'
import { checkExternalIntegrations } from '@/lib/integrations/health'

export async function GET() {
  try {
    const admin = await requireAdmin()
    const [integrations, aiProviders] = await Promise.all([
      checkExternalIntegrations(admin.id),
      prisma.aiProvider.findMany({ include: { models: { select: { key: true, status: true } }, healthChecks: { orderBy: { checkedAt: 'desc' }, take: 1 }, usages: { orderBy: { recordedAt: 'desc' }, take: 1 } }, orderBy: { priority: 'asc' } }),
    ])
    return NextResponse.json({ integrations, aiProviders: aiProviders.map((provider) => ({ key: provider.key, name: provider.name, status: provider.status, capabilities: provider.capabilities, models: provider.models, health: provider.healthChecks[0] || null, lastUsage: provider.usages[0] ? { status: provider.usages[0].status, recordedAt: provider.usages[0].recordedAt } : null })) })
  } catch (error) {
    const isAuth = error instanceof Error && error.message === 'ADMIN_REQUIRED'
    return NextResponse.json({ error: isAuth ? 'Unauthorized' : 'Unable to check integrations.' }, { status: isAuth ? 401 : 500 })
  }
}
