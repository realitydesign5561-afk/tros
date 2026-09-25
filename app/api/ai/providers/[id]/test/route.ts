import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/ai-gateway/admin'
import { testAIProvider } from '@/lib/ai-gateway/service'

const inputSchema = z.object({ capability: z.string().optional(), model: z.string().optional() })

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin()
    const input = inputSchema.safeParse(await request.json().catch(() => ({})))
    const result = await testAIProvider(params.id, (input.success && input.data.capability as any) || 'TEXT_GENERATION', input.success ? input.data.model : undefined, admin.id)
    return NextResponse.json({ ok: true, taskId: result.taskId, providerId: result.providerId, model: result.model, latencyMs: result.usage.durationMs, estimatedCost: result.estimatedCost })
  } catch (error) {
    const isAuth = error instanceof Error && error.message === 'ADMIN_REQUIRED'
    return NextResponse.json({ ok: false, error: isAuth ? 'Unauthorized' : error instanceof Error ? error.message : 'Provider test failed.' }, { status: isAuth ? 401 : 502 })
  }
}
