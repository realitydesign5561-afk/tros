import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { executeAITask } from '@/lib/ai-gateway/service'

const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp'])

function safeExtension(type: string) {
  return type === 'image/png' ? 'png' : 'jpg'
}

function buildPrompt(prompt: string, background: string) {
  return `Create an original visual design inspired by the user's written direction. Do not copy another design. Use ${background || 'an appropriate background color'} as the background direction. ${prompt.trim()}`
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
  const provider = String(form.get('provider') || 'automatic')
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
  const design = await prisma.design.create({ data: { prompt: buildPrompt(prompt, background), background: background || null, referenceUrl: `/designs/${referenceName}`, provider, outputFormat: format === 'jpg' ? 'jpg' : 'png', status: 'GENERATING', ownerId: session.user.id } })
  if (provider !== 'automatic' && provider !== 'gpt-4o') {
    await prisma.design.update({ where: { id: design.id }, data: { status: 'PROVIDER_NOT_CONNECTED' } })
    return NextResponse.json({ error: `No ${provider} image adapter is configured.`, designId: design.id }, { status: 503 })
  }

  try {
    const result = await executeAITask({ task: design.prompt, capability: 'IMAGE_GENERATION', imageSize: '1024x1024', userId: session.user.id, fallbackPolicy: { maxAttempts: 1 } })
    if (typeof result.output !== 'object' || !result.output.url) throw new Error('Image provider returned no verified image URL.')
    const completed = await prisma.design.update({ where: { id: design.id }, data: { outputUrl: result.output.url, provider: result.providerName, status: 'COMPLETED' } })
    return NextResponse.json({ ...completed, taskId: result.taskId, providerConnected: true }, { status: 201 })
  } catch (error) {
    await prisma.design.update({ where: { id: design.id }, data: { status: 'FAILED' } })
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Image generation failed.', designId: design.id }, { status: 502 })
  }
}
