import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { executeAITask } from '@/lib/ai-gateway/service'

const inputSchema = z.object({
  projectName: z.string().trim().min(2).max(80),
  niche: z.string().trim().min(2).max(120),
  pages: z.string().trim().min(2).max(500),
  brandColors: z.string().trim().min(2).max(180),
  generateSystem: z.boolean(),
  hasLogin: z.boolean(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = inputSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Complete all factory inputs before generating.' }, { status: 400 })

  const input = parsed.data
  const prompt = `Create a production-ready website blueprint for ${input.projectName}, a ${input.niche} brand. Pages: ${input.pages}. Brand colors: ${input.brandColors}. ${input.generateSystem ? 'Include a multi-tool client operating system with clear modules.' : 'Create a focused marketing website.'} ${input.hasLogin ? 'Include a Prisma User table and authenticated account flow in the data model.' : ''} Return concise JSON-like sections for pages, features, data model, and deployment notes.`
  let blueprint: string
  try {
    const result = await executeAITask({ task: prompt, capability: 'WEBSITE_GENERATION', userId: session.user.id, maxTokens: 700 })
    blueprint = typeof result.output === 'string' ? result.output : JSON.stringify(result.output)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Website generation failed.' }, { status: 502 })
  }
  const status = 'READY'

  const project = await prisma.project.create({ data: { name: input.projectName, niche: input.niche, pages: input.pages, brandColors: input.brandColors, generateSystem: input.generateSystem, hasLogin: input.hasLogin, prompt, blueprint, status, ownerId: session.user.id } })
  await prisma.analyticsEvent.create({ data: { name: 'website_factory_generated', source: 'website-factory', metadata: JSON.stringify({ projectId: project.id, hasLogin: input.hasLogin, generateSystem: input.generateSystem }) } })
  return NextResponse.json({ projectId: project.id, status, blueprint })
}
