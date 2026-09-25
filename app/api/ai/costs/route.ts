import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/ai-gateway/admin'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const limit = Math.min(200, Math.max(1, Number(new URL(request.url).searchParams.get('limit') || 50)))
    const costs = await prisma.providerCost.findMany({ take: limit, orderBy: { recordedAt: 'desc' }, include: { provider: { select: { name: true, key: true } }, model: { select: { name: true, key: true } } } })
    const total = costs.reduce((sum, cost) => sum + Number(cost.amount), 0)
    return NextResponse.json({ total, costs: costs.map((cost) => ({ ...cost, amount: Number(cost.amount) })) })
  } catch (error) {
    const isAuth = error instanceof Error && error.message === 'ADMIN_REQUIRED'
    return NextResponse.json({ error: isAuth ? 'Unauthorized' : 'Unable to load AI costs.' }, { status: isAuth ? 401 : 500 })
  }
}
