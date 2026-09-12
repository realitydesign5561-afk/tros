import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [projects, posts, leads, revenue, workflows, runs, keys] = await Promise.all([
    prisma.project.count(), prisma.socialPost.count(), prisma.lead.count(),
    prisma.paymentLink.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
    prisma.workflow.count(), prisma.workflowRun.count({ where: { status: { in: ['RUNNING', 'QUEUED'] } } }), prisma.apiKey.findMany({ select: { provider: true, label: true } }),
  ])
  return NextResponse.json({ metrics: { projects, posts, leads, revenue: revenue._sum.amount ?? 0 }, health: { workflows, activeRuns: runs, keys: keys.map((key) => ({ ...key, configured: true })) } })
}
