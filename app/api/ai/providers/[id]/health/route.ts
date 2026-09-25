import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/ai-gateway/admin'
import { providerHealth } from '@/lib/ai-gateway/service'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    return NextResponse.json({ health: await providerHealth(params.id) })
  } catch (error) {
    const isAuth = error instanceof Error && error.message === 'ADMIN_REQUIRED'
    return NextResponse.json({ error: isAuth ? 'Unauthorized' : 'Unable to load provider health.' }, { status: isAuth ? 401 : 500 })
  }
}
