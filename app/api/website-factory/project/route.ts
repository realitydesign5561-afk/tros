import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const bodySchema = z.object({
  projectId: z.string().min(1),
  action: z.enum(['import', 'deploy', 'domain', 'management']),
  value: z.string().trim().max(180).optional(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = bodySchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid project operation.' }, { status: 400 })
  const { projectId, action, value } = parsed.data
  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: session.user.id } })
  if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 })

  if (action === 'management') {
    if (!value) return NextResponse.json({ error: 'Add a maintenance or billing note.' }, { status: 400 })
    await prisma.managementLog.create({ data: { projectId, type: 'MAINTENANCE', title: value, details: 'Created from TROS project management.' } })
    await prisma.analyticsEvent.create({ data: { name: 'project_management_log_created', source: 'website-factory', metadata: JSON.stringify({ projectId }) } })
    return NextResponse.json({ ok: true, message: 'Management log added.' })
  }

  if (action === 'domain') {
    if (!value || !value.includes('.')) return NextResponse.json({ error: 'Enter a valid custom domain.' }, { status: 400 })
    await prisma.domainBinding.create({ data: { projectId, domain: value, status: 'PENDING' } })
    await prisma.project.update({ where: { id: projectId }, data: { domain: value } })
    return NextResponse.json({ ok: true, message: 'Domain saved as pending. Connect Vercel access to attach it.' })
  }

  if (action === 'import') {
    if (!value || !value.includes('github.com/')) return NextResponse.json({ error: 'Enter a GitHub repository URL.' }, { status: 400 })
    await prisma.project.update({ where: { id: projectId }, data: { source: 'GITHUB_IMPORT', repositoryUrl: value, status: 'IMPORTED' } })
    return NextResponse.json({ ok: true, message: 'Repository saved. GitHub authorization is required to sync files.' })
  }

  await prisma.deploymentSnapshot.create({ data: { projectId, status: 'PENDING_AUTHORIZATION' } })
  await prisma.project.update({ where: { id: projectId }, data: { status: 'DEPLOYMENT_PENDING', health: 'PENDING' } })
  return NextResponse.json({ ok: true, message: 'Deployment queued. Connect Vercel access to publish this project.' })
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const projectId = new URL(request.url).searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'Project ID is required.' }, { status: 400 })
  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: session.user.id }, include: { deployments: { orderBy: { checkedAt: 'desc' }, take: 5 }, domains: true, managementLogs: { orderBy: { createdAt: 'desc' }, take: 10 } } })
  if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  return NextResponse.json(project)
}
