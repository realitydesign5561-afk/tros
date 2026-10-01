'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, ChevronDown, Loader2, Pause, Play, RotateCcw, Send, Square, Wrench } from 'lucide-react'

type AgentTask = {
  id: string
  module: string
  prompt: string
  plan?: { intent?: string; requirements?: string[]; missingInformation?: string[]; steps?: { name: string; tool: string; input: Record<string, unknown> }[] } | null
  status: string
  progress: number
  currentStep?: string | null
  error?: string | null
  output?: { results?: unknown[] } | null
  conversationId?: string | null
}

type AgentEvent = { id: string; sequence: number; type: string; message: string; progress?: number | null }

const statusLabel: Record<string, string> = { QUEUED: 'Queued', PLANNING: 'Analyzing request...', RUNNING: 'Executing plan...', WAITING_FOR_INPUT: 'Waiting for input', VALIDATING: 'Validating outputs...', REPAIRING: 'Repairing...', COMPLETED: 'Completed.', FAILED: 'Failed', CANCELLED: 'Cancelled', PAUSED: 'Paused' }

export function UniversalAgentPrompt({ module = 'universal', projectId }: { module?: string; projectId?: string }) {
  const [prompt, setPrompt] = useState('')
  const [task, setTask] = useState<AgentTask | null>(null)
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [expanded, setExpanded] = useState(false)
  const [sending, setSending] = useState(false)
  const [requestError, setRequestError] = useState('')
  const eventSource = useRef<EventSource | null>(null)
  const idempotencyKey = useRef<string | null>(null)

  useEffect(() => () => eventSource.current?.close(), [])

  async function refreshTask(id: string) {
    const response = await fetch(`/api/agent/tasks/${id}`)
    if (response.ok) setTask((await response.json()).task)
  }

  function streamTask(id: string) {
    eventSource.current?.close()
    const source = new EventSource(`/api/agent/tasks/${id}/stream`)
    eventSource.current = source
    source.onmessage = (event) => {
      const next = JSON.parse(event.data) as AgentEvent
      setEvents((current) => current.some((item) => item.sequence === next.sequence) ? current : [...current, next])
      refreshTask(id)
    }
    source.addEventListener('status', (event) => {
      const status = JSON.parse((event as MessageEvent).data) as Partial<AgentTask>
      setTask((current) => current ? { ...current, ...status } : current)
      if (status.status && ['COMPLETED', 'FAILED', 'CANCELLED'].includes(status.status)) source.close()
    })
    source.onerror = () => source.close()
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!prompt.trim()) return
    setSending(true); setEvents([]); setRequestError('')
    idempotencyKey.current ||= crypto.randomUUID()
    let response: Response
    try {
      response = await fetch('/api/agent/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey.current }, body: JSON.stringify({ prompt, module, projectId, conversationId: task?.conversationId || undefined }) })
    } catch {
      setSending(false)
      setRequestError('Request did not reach the server. Retry to safely reuse the same task key.')
      return
    }
    const data = await response.json().catch(() => ({}))
    setSending(false)
    if (!response.ok) return setTask({ id: '', module, prompt, status: 'FAILED', progress: 0, error: data.error || 'Unable to queue task.' })
    idempotencyKey.current = null
    setTask(data.task); setPrompt(''); setExpanded(true); streamTask(data.task.id)
  }

  async function control(action: 'pause' | 'resume' | 'cancel' | 'retry' | 'approve') {
    if (!task?.id) return
    const requiresReconciliation = action === 'resume' && task.error?.startsWith('Worker lease expired during ')
    if (requiresReconciliation && !window.confirm('Confirm that you checked the external service and the interrupted action did not complete. TROS will retry it.')) return
    const resolvedAction = requiresReconciliation ? 'resolve' : action
    const response = await fetch(`/api/agent/tasks/${task.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: resolvedAction }) })
    if (response.ok) { setTask((await response.json()).task); if (['resume', 'retry', 'approve'].includes(resolvedAction)) streamTask(task.id) }
  }

  return <section className="mb-6 rounded-2xl border border-primary/25 bg-primary/5 p-4 shadow-sm sm:p-5"><form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Bot className="size-4" /></div><input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Tell TROS what you want to accomplish..." className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring" /><button disabled={sending} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">{sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}Run with agent</button>{task && <button type="button" onClick={() => setExpanded((value) => !value)} className="flex size-11 items-center justify-center rounded-xl border border-border bg-background" aria-label="Toggle agent task details"><ChevronDown className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`} /></button>}</form>{requestError && <p className="mt-2 text-sm text-destructive" role="alert">{requestError}</p>}{task && expanded && <div className="mt-4 space-y-4 border-t border-primary/15 pt-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Universal Agent · {task.module}</p><p className="mt-1 text-sm font-medium">{statusLabel[task.status] || task.status}{task.currentStep ? ` · ${task.currentStep}` : ''}</p></div><div className="flex flex-wrap gap-2">{['QUEUED', 'PLANNING', 'RUNNING', 'REPAIRING'].includes(task.status) && <button type="button" onClick={() => control('pause')} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs"><Pause className="size-3" />Pause</button>}{task.status === 'PAUSED' && <button type="button" onClick={() => control('resume')} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs"><Play className="size-3" />Resume</button>}{task.status === 'WAITING_FOR_INPUT' && <><button type="button" onClick={() => control('approve')} className="inline-flex items-center gap-1.5 rounded-lg border border-primary bg-primary/10 px-2.5 py-1.5 text-xs text-primary"><Wrench className="size-3" />Approve</button><button type="button" onClick={() => control('resume')} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs"><Play className="size-3" />Continue</button></>}{task.status === 'FAILED' && <button type="button" onClick={() => control('retry')} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs"><RotateCcw className="size-3" />Retry</button>}{!['COMPLETED', 'FAILED', 'CANCELLED'].includes(task.status) && <button type="button" onClick={() => control('cancel')} className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-2.5 py-1.5 text-xs text-destructive"><Square className="size-3" />Cancel</button>}</div></div><div className="h-2 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${task.progress}%` }} /></div>{task.error && <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">{task.error}</p>}{task.plan && <details open className="rounded-xl border border-border bg-background p-3"><summary className="cursor-pointer text-xs font-semibold">Execution plan</summary><div className="mt-3 space-y-2 text-xs text-muted-foreground"><p>{task.plan.intent}</p>{task.plan.missingInformation?.length ? <p>Missing: {task.plan.missingInformation.join(', ')}</p> : null}{task.plan.steps?.map((step, index) => <div key={`${step.tool}-${index}`} className="flex gap-2"><span className="font-mono text-primary">{index + 1}</span><span>{step.name} · <span className="font-mono">{step.tool}</span></span></div>)}</div></details>}<div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progress log</p>{events.slice(-8).map((event) => <div key={event.id} className="flex gap-2 text-xs text-muted-foreground"><span className="font-mono text-primary">{event.progress ?? task.progress}%</span><span>{event.message}</span></div>)}</div></div>}</section>
}
