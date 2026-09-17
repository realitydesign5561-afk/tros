import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type WorkflowGraph = {
  nodes: { id: string; type: string; position: { x: number; y: number }; data: { label: string; kind: string; description: string } }[]
  edges: { id: string; source: string; target: string; animated: boolean }[]
}

const fallbackGraph = (prompt: string): WorkflowGraph => {
  const normalized = prompt.toLowerCase()
  const trigger = normalized.includes('schedule') || normalized.includes('every')
    ? ['Schedule', 'Run on a recurring interval']
    : normalized.includes('email')
      ? ['New email', 'When an inbox message arrives']
      : normalized.includes('comment')
        ? ['New IG comment', 'When someone comments on a post']
        : ['New lead', 'When a lead enters TROS']
  const action = normalized.includes('slack')
    ? ['Notify Slack', 'Post a message to a channel']
    : normalized.includes('sheet')
      ? ['Add to Google Sheet', 'Append a row to a spreadsheet']
      : normalized.includes('webhook')
        ? ['Webhook', 'POST data to an external URL']
        : normalized.includes('email')
          ? ['Send email', 'Deliver an email message']
          : ['AI reply', 'Generate a contextual response']
  return {
    nodes: [
      { id: 'trigger-ai', type: 'trigger', position: { x: 120, y: 160 }, data: { label: trigger[0], kind: 'TRIGGER', description: trigger[1] } },
      { id: 'action-ai', type: 'action', position: { x: 480, y: 160 }, data: { label: action[0], kind: 'ACTION', description: action[1] } },
    ],
    edges: [{ id: 'edge-ai', source: 'trigger-ai', target: 'action-ai', animated: true }],
  }
}

function parseGraph(text: string, prompt: string): { name: string; graph: WorkflowGraph } {
  try {
    const parsed = JSON.parse(text.replace(/^```json\s*/i, '').replace(/\s*```$/, '')) as { name?: unknown; nodes?: unknown; edges?: unknown }
    if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges) && parsed.nodes.every((node) => {
      const item = node as Record<string, unknown>
      const data = item.data as Record<string, unknown> | undefined
      return typeof item.id === 'string' && typeof item.type === 'string' && typeof data?.label === 'string' && typeof data.kind === 'string' && typeof data.description === 'string'
    }) && parsed.edges.every((edge) => {
      const item = edge as Record<string, unknown>
      return typeof item.id === 'string' && typeof item.source === 'string' && typeof item.target === 'string'
    })) return { name: typeof parsed.name === 'string' ? parsed.name : prompt.slice(0, 60), graph: { nodes: parsed.nodes as WorkflowGraph['nodes'], edges: parsed.edges as WorkflowGraph['edges'] } }
  } catch {}
  return { name: prompt.trim().replace(/\s+/g, ' ').slice(0, 60), graph: fallbackGraph(prompt) }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as { prompt?: string }
  const prompt = String(body.prompt || '').trim()
  if (prompt.length < 3) return NextResponse.json({ error: 'Describe the workflow first.' }, { status: 400 })

  let result = { name: prompt.slice(0, 60), graph: fallbackGraph(prompt) }
  if (process.env.AI_GATEWAY_API_KEY) {
    try {
      const generated = await generateText({
        model: gateway('openai/gpt-4o-mini'),
        maxOutputTokens: 900,
        prompt: `Design an automation workflow for Activepieces from this request: ${prompt}. Return JSON only with name, nodes, and edges. Nodes must be React Flow-compatible objects with id, type, position, and data {label, kind, description}; kind must be TRIGGER or ACTION. Edges must contain id, source, target, animated. Keep it to 2-6 practical steps.`,
      })
      result = parseGraph(generated.text, prompt)
    } catch {}
  }

  const workflow = await prisma.workflow.create({ data: { name: result.name, template: 'ai-generated', graph: JSON.stringify(result.graph), ownerId: userId } })
  return NextResponse.json({ workflow, fallback: !process.env.AI_GATEWAY_API_KEY })
}
