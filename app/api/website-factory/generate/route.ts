import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { createWebsiteBuild } from '@/lib/website-factory/pipeline'

const inputSchema = z.object({
  prompt: z.string().trim().min(20).max(20_000).optional(),
  projectName: z.string().trim().min(2).max(80).optional(),
  niche: z.string().trim().min(2).max(120).optional(),
  pages: z.string().trim().min(2).max(500).optional(),
  brandColors: z.string().trim().min(2).max(180).optional(),
  generateSystem: z.boolean().optional(),
  hasLogin: z.boolean().optional(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = inputSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Enter a detailed website request.' }, { status: 400 })

  const input = parsed.data
  const prompt = input.prompt || `Build a ${input.niche || 'modern business'} website named ${input.projectName || 'New Website'}. Pages: ${input.pages || 'Home, About, Services, Contact'}. Brand colors: ${input.brandColors || 'Use a cohesive accessible palette'}. ${input.generateSystem ? 'Include an authenticated operating system.' : ''} ${input.hasLogin ? 'Include authentication.' : ''}`
  const { project, build } = await createWebsiteBuild({ ownerId: session.user.id, projectName: input.projectName || 'AI Website Project', prompt, niche: input.niche, pages: input.pages, brandColors: input.brandColors, generateSystem: input.generateSystem, hasLogin: input.hasLogin })
  return NextResponse.json({ projectId: project.id, buildId: build.id, status: build.status, stage: build.stage, progress: build.progress }, { status: 202 })
}
