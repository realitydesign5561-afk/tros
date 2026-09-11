import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp'])

function safeExtension(type: string) {
  return type === 'image/png' ? 'png' : 'jpg'
}

function buildPrompt(prompt: string, background: string) {
  return `Copy this design exactly. Only change background color to ${background || 'the requested color'}. Keep fonts, layout, spacing, and hierarchy. ${prompt.trim()}`
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const designs = await prisma.design.findMany({ where: { ownerId: session.user.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(designs)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const form = await request.formData()
  const prompt = String(form.get('prompt') || '').trim()
  const background = String(form.get('background') || '').trim()
  const provider = String(form.get('provider') || 'gpt-4o')
  const format = String(form.get('format') || 'png').toLowerCase()
  const file = form.get('reference')
  if (!prompt) return NextResponse.json({ error: 'Add a design prompt.' }, { status: 400 })
  if (!(file instanceof File) || !allowedTypes.has(file.type)) return NextResponse.json({ error: 'Upload a PNG, JPG, or WebP reference image.' }, { status: 400 })
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Reference images must be smaller than 8 MB.' }, { status: 400 })

  const designsDir = path.join(process.cwd(), 'public', 'designs')
  await mkdir(designsDir, { recursive: true })
  const id = crypto.randomUUID()
  const extension = safeExtension(file.type)
  const referenceName = `${id}-reference.${extension}`
  await writeFile(path.join(designsDir, referenceName), Buffer.from(await file.arrayBuffer()))
  const design = await prisma.design.create({ data: { prompt: buildPrompt(prompt, background), background: background || null, referenceUrl: `/designs/${referenceName}`, provider, outputFormat: format === 'jpg' ? 'jpg' : 'png', status: provider === 'gpt-4o' ? 'QUEUED' : 'PROVIDER_NOT_CONNECTED', ownerId: session.user.id } })
  return NextResponse.json({ ...design, providerConnected: provider === 'gpt-4o' ? Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) : Boolean(process.env.MIDJOURNEY_API_URL && process.env.MIDJOURNEY_API_KEY) }, { status: 201 })
}
