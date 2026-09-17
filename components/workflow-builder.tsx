'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { addEdge, Background, Controls, MiniMap, useEdgesState, useNodesState, type Connection, type Edge, type Node } from '@xyflow/react'

const FlowCanvas = dynamic(() => import('@xyflow/react').then((module) => module.ReactFlow), { ssr: false }) as typeof import('@xyflow/react').ReactFlow<BuilderNode, Edge>
import '@xyflow/react/dist/style.css'
import { AlertCircle, Check, ChevronDown, Copy, Play, Plus, Save, Search, Sparkles, Trash2, Wand2, X } from 'lucide-react'

const templates = [
  { id: 'blank', label: 'Blank workflow', description: 'Start from an empty canvas' },
  { id: 'leadToSheet', label: 'New Lead to Google Sheet', description: 'Capture and route new leads' },
  { id: 'instagramReply', label: 'New IG Comment to AI Reply', description: 'Draft a response to every comment' },
]

const nodeOptions = [
  { kind: 'TRIGGER' as const, label: 'New lead', description: 'When a lead enters TROS' },
  { kind: 'TRIGGER' as const, label: 'New IG comment', description: 'When someone comments on a post' },
  { kind: 'TRIGGER' as const, label: 'Form submission', description: 'When a form is filled' },
  { kind: 'TRIGGER' as const, label: 'New email', description: 'When an inbox message arrives' },
  { kind: 'TRIGGER' as const, label: 'Schedule', description: 'Run on a recurring interval' },
  { kind: 'ACTION' as const, label: 'Add to Google Sheet', description: 'Append a row to a spreadsheet' },
  { kind: 'ACTION' as const, label: 'AI reply', description: 'Generate a contextual response' },
  { kind: 'ACTION' as const, label: 'Send email', description: 'Deliver an email message' },
  { kind: 'ACTION' as const, label: 'Notify Slack', description: 'Post a message to a channel' },
  { kind: 'ACTION' as const, label: 'Create CRM lead', description: 'Insert a lead into the pipeline' },
  { kind: 'ACTION' as const, label: 'Webhook', description: 'POST data to an external URL' },
  { kind: 'ACTION' as const, label: 'Filter', description: 'Continue only when conditions match' },
]

type WorkflowRecord = { id: string; name: string; template?: string | null; graph: string; status: string; alerts: { id: string; message: string }[]; runs: { id: string; status: string; logs?: string | null; startedAt: string }[] }

type BuilderNode = Node<{ label: string; kind: string; description: string }>

const nodeStyle = (kind: string) => ({ background: kind === 'TRIGGER' ? 'hsl(var(--primary))' : 'hsl(var(--card))', color: kind === 'TRIGGER' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: 12, minWidth: 190 })

export function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([])
  const [workflowId, setWorkflowId] = useState<string | null>(null)
  const [name, setName] = useState('Untitled workflow')
  const [template, setTemplate] = useState('blank')
  const [nodes, setNodes, onNodesChange] = useNodesState<BuilderNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [search, setSearch] = useState('')
  const [prompt, setPrompt] = useState('')

  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedId), [nodes, selectedId])
  const activeWorkflow = workflows.find((workflow) => workflow.id === workflowId)
  const filteredWorkflows = workflows.filter((workflow) => workflow.name.toLowerCase().includes(search.toLowerCase()))

  const loadWorkflows = useCallback(async () => {
    const response = await fetch('/api/workflows')
    if (!response.ok) return
    const data = await response.json() as WorkflowRecord[]
    setWorkflows(data)
    if (data[0] && !workflowId) loadWorkflow(data[0])
  }, [workflowId])

  const loadWorkflow = (workflow: WorkflowRecord) => {
    const graph = JSON.parse(workflow.graph) as { nodes: BuilderNode[]; edges: Edge[] }
    setWorkflowId(workflow.id)
    setName(workflow.name)
    setTemplate(workflow.template || 'blank')
    setNodes(graph.nodes.map((node) => ({ ...node, style: nodeStyle(node.data.kind) })))
    setEdges(graph.edges)
    setSelectedId(null)
    setNotice(null)
  }

  useEffect(() => { void loadWorkflows() }, [loadWorkflows])

  const onConnect = useCallback((connection: Connection) => setEdges((current) => addEdge({ ...connection, animated: true }, current)), [setEdges])

  async function createWorkflow(nextTemplate = template) {
    const response = await fetch('/api/workflows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nextTemplate === 'blank' ? 'Untitled workflow' : templates.find((item) => item.id === nextTemplate)?.label, template: nextTemplate }) })
    if (!response.ok) return
    const workflow = await response.json() as WorkflowRecord
    setWorkflows((current) => [workflow, ...current])
    loadWorkflow(workflow)
    setNotice('Workflow created.')
  }

  async function generateFromPrompt() {
    const words = prompt.trim().split(/\s+/).slice(0, 7).join(' ')
    if (!words) return setNotice('Describe the workflow you want to build first.')
    const lower = prompt.toLowerCase()
    const trigger = nodeOptions.find((item) => item.kind === 'TRIGGER' && (lower.includes(item.label.toLowerCase()) || (item.label === 'Schedule' && lower.includes('every')))) || nodeOptions[0]
    const action = nodeOptions.find((item) => item.kind === 'ACTION' && lower.includes(item.label.toLowerCase().split(' ')[0])) || nodeOptions[6]
    const graph = { nodes: [{ id: 'trigger-ai', type: 'trigger', position: { x: 120, y: 160 }, data: { label: trigger.label, kind: trigger.kind, description: trigger.description } }, { id: 'action-ai', type: 'action', position: { x: 480, y: 160 }, data: { label: action.label, kind: action.kind, description: action.description } }], edges: [{ id: 'edge-ai', source: 'trigger-ai', target: 'action-ai', animated: true }] }
    const response = await fetch('/api/workflows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: words, template: 'ai-generated', graph }) })
    if (!response.ok) return setNotice('Could not generate workflow.')
    const workflow = await response.json() as WorkflowRecord
    setWorkflows((current) => [workflow, ...current])
    loadWorkflow(workflow)
    setPrompt('')
    setNotice('AI workflow draft generated. Review the steps before running it.')
  }

  async function deleteWorkflow() {
    if (!workflowId) return
    const response = await fetch(`/api/workflows/${workflowId}`, { method: 'DELETE' })
    if (!response.ok) return setNotice('Could not delete workflow.')
    setWorkflowId(null)
    setNodes([])
    setEdges([])
    setName('Untitled workflow')
    setNotice('Workflow deleted.')
    await loadWorkflows()
  }

  async function duplicateWorkflow() {
    if (!activeWorkflow) return
    const response = await fetch('/api/workflows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `${activeWorkflow.name} copy`, template: activeWorkflow.template, graph: { nodes: nodes.map(({ style, ...node }) => node), edges } }) })
    if (!response.ok) return setNotice('Could not duplicate workflow.')
    const workflow = await response.json() as WorkflowRecord
    setWorkflows((current) => [workflow, ...current])
    loadWorkflow(workflow)
    setNotice('Workflow duplicated.')
  }

  async function saveWorkflow() {
    if (!workflowId) return createWorkflow()
    setIsSaving(true)
    const response = await fetch(`/api/workflows/${workflowId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, graph: { nodes: nodes.map(({ style, ...node }) => node), edges } }) })
    setIsSaving(false)
    if (response.ok) { setNotice('Workflow saved to SQLite.'); await loadWorkflows() } else setNotice('Could not save workflow.')
  }

  async function runWorkflow() {
    if (!workflowId) return
    setIsRunning(true)
    const response = await fetch(`/api/workflows/${workflowId}/run`, { method: 'POST' })
    const data = await response.json() as { run?: { status: string; logs?: string }; warning?: string }
    setIsRunning(false)
    setNotice(data.run?.logs || data.warning || 'Workflow run finished.')
    await loadWorkflows()
  }

  function addNode(kind: 'TRIGGER' | 'ACTION', option = nodeOptions.find((item) => item.kind === kind)!) {
    const id = `${kind.toLowerCase()}-${Date.now()}`
    setNodes((current) => [...current, { id, type: 'default', position: { x: 160 + current.length * 40, y: 110 + current.length * 55 }, data: { label: option.label, kind, description: option.description }, style: nodeStyle(kind) }])
    setSelectedId(id)
  }

  function updateSelected(updates: Partial<BuilderNode['data']>) {
    if (!selectedId) return
    setNodes((current) => current.map((node) => node.id === selectedId ? { ...node, data: { ...node.data, ...updates }, style: nodeStyle(updates.kind || node.data.kind) } : node))
  }

  const alerts = activeWorkflow?.alerts || []
  const runs = activeWorkflow?.runs || []

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div><p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Automation studio</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Workflow Builder</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Compose reliable automations visually, save each graph to SQLite, and dispatch to Activepieces when connected.</p></div>
        <div className="flex flex-wrap gap-2"><button className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent" onClick={() => createWorkflow()}><Plus className="size-4" />New workflow</button><button className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90" onClick={saveWorkflow}><Save className="size-4" />{isSaving ? 'Saving...' : 'Save'}</button><button className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent" onClick={runWorkflow} disabled={!workflowId || isRunning}><Play className="size-4" />{isRunning ? 'Running...' : 'Run'}</button><button className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent" onClick={duplicateWorkflow} disabled={!workflowId}><Copy className="size-4" />Duplicate</button><button className="inline-flex items-center gap-2 rounded-md border border-destructive/30 px-3 py-2 text-sm text-destructive hover:bg-destructive/10" onClick={deleteWorkflow} disabled={!workflowId}><Trash2 className="size-4" />Delete</button></div>
      </div>

      {notice && <div className="flex items-start gap-3 rounded-lg border border-border bg-accent/40 px-4 py-3 text-sm"><Sparkles className="mt-0.5 size-4 text-primary" /><span className="flex-1">{notice}</span><button aria-label="Dismiss notice" onClick={() => setNotice(null)}><X className="size-4 text-muted-foreground" /></button></div>}

      <section className="rounded-xl border border-primary/25 bg-primary/5 p-4"><div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /><p className="text-sm font-semibold">Build from a prompt</p><span className="text-xs text-muted-foreground">AI draft</span></div><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void generateFromPrompt() }} placeholder="When I get a new lead, add it to a sheet and notify Slack" className="h-10 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /><button type="button" onClick={() => void generateFromPrompt()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"><Wand2 className="size-4" />Generate draft</button></div></section>

      <section className="rounded-xl border border-border bg-card p-3"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><Search className="size-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search saved workflows" className="h-9 w-full bg-transparent text-sm outline-none sm:w-64" /></div><p className="text-xs text-muted-foreground">{filteredWorkflows.length} saved workflow{filteredWorkflows.length === 1 ? '' : 's'}</p></div>{filteredWorkflows.length > 0 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{filteredWorkflows.map((workflow) => <button key={workflow.id} type="button" onClick={() => loadWorkflow(workflow)} className={`shrink-0 rounded-lg border px-3 py-2 text-left text-xs ${workflow.id === workflowId ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent'}`}><span className="block max-w-44 truncate font-medium">{workflow.name}</span><span className="mt-1 block text-muted-foreground">{workflow.status}</span></button>)}</div>}</section>

      <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
        <aside className="rounded-xl border border-border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Templates</p><div className="mt-3 space-y-2">{templates.map((item) => <button key={item.id} className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${template === item.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent'}`} onClick={() => { setTemplate(item.id); if (item.id !== 'blank') void createWorkflow(item.id) }}><p className="text-sm font-medium">{item.label}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p></button>)}</div><div className="mt-6 border-t border-border pt-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Node palette</p><div className="mt-3 space-y-2">{nodeOptions.map((item) => <button key={`${item.kind}-${item.label}`} type="button" className="flex w-full items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-left text-xs hover:bg-accent" onClick={() => addNode(item.kind, item)}><span className={`size-2 rounded-full ${item.kind === 'TRIGGER' ? 'bg-primary' : 'bg-muted-foreground'}`} /><span><span className="block font-medium">{item.label}</span><span className="block text-[10px] text-muted-foreground">{item.description}</span></span></button>)}</div></div></aside>

        <section className="overflow-hidden rounded-xl border border-border bg-card"><div className="flex items-center justify-between border-b border-border px-4 py-3"><div className="flex items-center gap-3"><input value={name} onChange={(event) => setName(event.target.value)} className="w-56 bg-transparent text-sm font-medium outline-none" aria-label="Workflow name" /><span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${activeWorkflow?.status === 'ERROR' ? 'bg-destructive/15 text-destructive' : 'bg-emerald-500/15 text-emerald-500'}`}>{activeWorkflow?.status || 'DRAFT'}</span></div><span className="text-xs text-muted-foreground">Drag nodes · connect handles</span></div><div className="h-[520px] bg-background/60"><FlowCanvas nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_, node) => setSelectedId(node.id)} fitView proOptions={{ hideAttribution: true }}><Background color="hsl(var(--border))" gap={24} /><Controls /><MiniMap nodeColor={(node) => node.data?.kind === 'TRIGGER' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} /></FlowCanvas></div></section>

        <aside className="space-y-5"><div className="rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Inspector</p>{selectedNode && <button aria-label="Close inspector" onClick={() => setSelectedId(null)}><X className="size-4 text-muted-foreground" /></button>}</div>{selectedNode ? <div className="mt-4 space-y-3"><label className="block text-xs text-muted-foreground">Node label<input value={selectedNode.data.label} onChange={(event) => updateSelected({ label: event.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none" /></label><label className="block text-xs text-muted-foreground">Description<textarea value={selectedNode.data.description} onChange={(event) => updateSelected({ description: event.target.value })} className="mt-1 min-h-24 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none" /></label></div> : <p className="mt-4 text-sm leading-6 text-muted-foreground">Select a node to edit its label and behavior notes.</p>}</div><div className="rounded-xl border border-border bg-card p-4"><div className="flex items-center gap-2"><AlertCircle className="size-4 text-amber-500" /><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Activity & alerts</p></div>{alerts.length === 0 && runs.length === 0 ? <p className="mt-4 text-sm leading-6 text-muted-foreground">Runs, failures, and provider status will appear here.</p> : <div className="mt-4 space-y-3">{alerts.map((alert) => <div key={alert.id} className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">{alert.message}</div>)}{runs.map((run) => <div key={run.id} className="flex items-start gap-2 rounded-md border border-border p-3"><Check className="mt-0.5 size-3.5 text-emerald-500" /><div><p className="text-xs font-medium">Run {run.status.toLowerCase()}</p><p className="mt-1 text-xs text-muted-foreground">{run.logs}</p></div></div>)}</div>}</div></aside>
      </div>
    </div>
  )
}
