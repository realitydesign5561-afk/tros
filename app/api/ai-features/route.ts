import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const features = await prisma.aiFeature.findMany({ where: { ownerId: session.user.id }, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ features })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const name = String(body.name || '').trim()
  const prompt = String(body.prompt || '').trim()
  if (!name || !prompt) return NextResponse.json({ error: 'Name and prompt are required.' }, { status: 400 })
  const provider = ['copilot', 'lovable', 'custom'].includes(body.provider) ? body.provider : 'copilot'
  const feature = await prisma.aiFeature.create({
    data: { name, prompt, description: body.description ? String(body.description) : null, provider, externalUrl: body.externalUrl ? String(body.externalUrl) : null, ownerId: session.user.id },
  })
  return NextResponse.json({ feature })
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Missing feature id.' }, { status: 400 })
  const data: Record<string, unknown> = {}
  if (typeof body.status === 'string') data.status = body.status
  if (typeof body.name === 'string') data.name = body.name
  if (typeof body.description === 'string') data.description = body.description
  if (typeof body.prompt === 'string') data.prompt = body.prompt
  if (typeof body.provider === 'string') data.provider = body.provider
  if (typeof body.externalUrl === 'string') data.externalUrl = body.externalUrl
  const updated = await prisma.aiFeature.updateMany({ where: { id: body.id, ownerId: session.user.id }, data })
  return NextResponse.json({ updated: updated.count })
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing feature id.' }, { status: 400 })
  const deleted = await prisma.aiFeature.deleteMany({ where: { id, ownerId: session.user.id } })
  return NextResponse.json({ deleted: deleted.count })
}
