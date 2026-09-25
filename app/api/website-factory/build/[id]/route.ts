import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deployWebsiteBuild, repairWebsiteBuild } from '@/lib/website-factory/pipeline'

const actionSchema = z.object({ action: z.enum(['fix', 'improve', 'deploy', 'rollback']), instruction: z.string().trim().max(2_000).optional(), versionId: z.string().optional(), pushGitHub: z.boolean().optional() })

async function ownerId() { return (await getServerSession(authOptions))?.user?.id }

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const userId = await ownerId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const build = await prisma.websiteBuild.findFirst({ where: { id: params.id, ownerId: userId }, include: { steps: { orderBy: { sequence: 'asc' } }, files: { orderBy: { path: 'asc' } }, logs: { orderBy: { sequence: 'asc' } }, versions: { orderBy: { version: 'desc' } }, project: { select: { id: true, name: true, repositoryUrl: true, deploymentUrl: true, domain: true, status: true, health: true } } } })
  if (!build) return NextResponse.json({ error: 'Build not found.' }, { status: 404 })
  return NextResponse.json({ build })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const userId = await ownerId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = actionSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid Website Factory action.' }, { status: 400 })
  const build = await prisma.websiteBuild.findFirst({ where: { id: params.id, ownerId: userId } })
  if (!build) return NextResponse.json({ error: 'Build not found.' }, { status: 404 })
  try {
    if (parsed.data.action === 'fix') return NextResponse.json({ build: await repairWebsiteBuild(build.id, parsed.data.instruction) }, { status: 202 })
    if (parsed.data.action === 'deploy') return NextResponse.json(await deployWebsiteBuild(build.id, parsed.data.pushGitHub), { status: 202 })
    if (parsed.data.action === 'improve') {
      const project = await prisma.project.findUniqueOrThrow({ where: { id: build.projectId } })
      const improved = await prisma.websiteBuild.create({ data: { ownerId: userId, projectId: project.id, prompt: `${build.prompt}\nImprove the existing implementation: ${parsed.data.instruction || 'Make the experience more premium and responsive.'}` } })
      return NextResponse.json({ build: improved }, { status: 202 })
    }
    if (!parsed.data.versionId) return NextResponse.json({ error: 'Select a version to roll back.' }, { status: 400 })
    const version = await prisma.projectVersion.findFirst({ where: { id: parsed.data.versionId, projectId: build.projectId } })
    if (!version) return NextResponse.json({ error: 'Version not found.' }, { status: 404 })
    await prisma.project.update({ where: { id: build.projectId }, data: { status: 'PREVIEW_READY', health: 'PREVIEW_READY', blueprint: JSON.stringify(version.manifest) } })
    await prisma.managementLog.create({ data: { projectId: build.projectId, type: 'ROLLBACK', title: `Rolled back to version ${version.version}`, details: 'Rollback requested from Website Factory.' } })
    return NextResponse.json({ ok: true, version: version.version })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Website action failed.' }, { status: 409 })
  }
}
