import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const templates = {
  leadToSheet: {
    name: 'New Lead to Google Sheet',
    nodes: [
      { id: 'trigger-lead', type: 'trigger', position: { x: 120, y: 140 }, data: { label: 'New lead captured', kind: 'TRIGGER', description: 'When a lead enters TROS' } },
      { id: 'action-sheet', type: 'action', position: { x: 460, y: 140 }, data: { label: 'Add row to Google Sheet', kind: 'ACTION', description: 'Append contact details' } },
    ],
    edges: [{ id: 'edge-lead-sheet', source: 'trigger-lead', target: 'action-sheet', animated: true }],
  },
  instagramReply: {
    name: 'New IG Comment to AI Reply',
    nodes: [
      { id: 'trigger-comment', type: 'trigger', position: { x: 120, y: 140 }, data: { label: 'New Instagram comment', kind: 'TRIGGER', description: 'Watch comments on a post' } },
      { id: 'action-reply', type: 'action', position: { x: 460, y: 140 }, data: { label: 'Draft AI reply', kind: 'ACTION', description: 'Generate a helpful response' } },
    ],
    edges: [{ id: 'edge-comment-reply', source: 'trigger-comment', target: 'action-reply', animated: true }],
  },
}

function fallbackGraph() {
  return { nodes: [{ id: 'trigger-1', type: 'trigger', position: { x: 120, y: 160 }, data: { label: 'Choose a trigger', kind: 'TRIGGER', description: 'Start your automation here' } }], edges: [] }
}

export function getTemplateGraph(template?: string | null) {
  if (template === 'leadToSheet') return templates.leadToSheet
  if (template === 'instagramReply') return templates.instagramReply
  return { name: 'Blank workflow', ...fallbackGraph() }
}

async function sessionUser() {
  const session = await getServerSession(authOptions)
  return session?.user?.id
}

export async function GET() {
  const userId = await sessionUser()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const workflows = await prisma.workflow.findMany({ where: { ownerId: userId }, include: { alerts: { where: { acknowledged: false }, orderBy: { createdAt: 'desc' }, take: 5 }, runs: { orderBy: { startedAt: 'desc' }, take: 5 } }, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json(workflows)
}

export async function POST(request: Request) {
  const userId = await sessionUser()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const input = await request.json() as { name?: string; template?: string; graph?: unknown }
  const template = getTemplateGraph(input.template)
  const workflow = await prisma.workflow.create({ data: { name: input.name?.trim() || template.name, template: input.template || null, graph: JSON.stringify(input.graph || { nodes: template.nodes, edges: template.edges }), ownerId: userId } })
  return NextResponse.json(workflow, { status: 201 })
}
