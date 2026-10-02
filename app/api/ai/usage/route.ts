import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/ai-gateway/admin'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const limit = Math.min(200, Math.max(1, Number(new URL(request.url).searchParams.get('limit') || 50)))
    const usage = await prisma.providerUsage.findMany({ take: limit, orderBy: { recordedAt: 'desc' }, include: { provider: { select: { name: true, key: true } }, model: { select: { name: true, key: true } } } })
    return NextResponse.json({ usage })
  } catch (error) {
    const isAuth = error instanceof Error && error.message === 'ADMIN_REQUIRED'
    return NextResponse.json({ error: isAuth ? 'Unauthorized' : 'Unable to load AI usage.' }, { status: isAuth ? 401 : 500 })
  }
}
