'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, KeyRound, Play, RefreshCw, ShieldCheck, Sparkles, WandSparkles } from 'lucide-react'

const providers = [
  ['Vercel AI Gateway', 'AI generation, routing, and fallback orchestration'],
  ['Activepieces', 'Prompt-to-workflow generation and activation'],
  ['Website builders', 'v0, Lovable, Bolt, Gemini, and compatible adapters'],
  ['Social channels', 'Compliant scheduling and official publishing APIs'],
  ['YouTube', 'Faceless video metadata, thumbnails, and publishing'],
  ['Email and WhatsApp', 'Lead alerts and approved outreach notifications'],
]

const modules = [
  { name: 'AI feature builder', status: 'Ready', description: 'Describe a capability and receive a reviewable implementation proposal.', action: 'Generate proposal' },
  { name: 'Website factory', status: 'Ready', description: 'Describe a site and route generation through the best configured builder.', action: 'Start generation' },
  { name: 'Workflow builder', status: 'Ready', description: 'Turn a prompt into an Activepieces workflow draft with activation and repair controls.', action: 'Create workflow' },
  { name: 'Social OS', status: 'Review', description: 'Create compliant scheduled content with manual approval and channel health.', action: 'Create content' },
  { name: 'Course studio', status: 'Ready', description: 'Plan cohort and masterclass curriculum from a niche prompt.', action: 'Draft course' },
  { name: 'YouTube OS', status: 'Review', description: 'Research-led faceless content plans, thumbnails, and publishing queues.', action: 'Plan episode' },
  { name: 'AI designer', status: 'Ready', description: 'Generate brand and graphic design directions from prompts or references.', action: 'Open designer' },
  { name: 'Lead generation', status: 'Review', description: 'Keep project lead pipelines isolated with compliant outreach and alerts.', action: 'Create campaign' },
]

export function AutomationControlPlane() {
  const [prompt, setPrompt] = useState('')
  const [message, setMessage] = useState('')
  const [autoMode, setAutoMode] = useState(true)
  const [activeModule, setActiveModule] = useState('')
  const configuredCount = useMemo(() => providers.filter((_, index) => index < 2).length, [])

  function run(module: string) {
    setActiveModule(module)
    setMessage(`${module} queued in test mode. Connect the provider in Settings to activate live execution.`)
  }

  function generateFeature() {
    if (!prompt.trim()) return setMessage('Describe the feature you want to add first.')
    setMessage('Feature proposal generated for review. No production files or live workflows are changed automatically.')
  }

  return <div className="space-y-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Operations command center</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Business automation</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">One control plane for AI generation, workflows, publishing, team access, and provider health.</p></div>
      <button type="button" onClick={() => setAutoMode((value) => !value)} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${autoMode ? 'bg-primary text-primary-foreground' : 'border border-border bg-card'}`}><ShieldCheck className="size-4" />Automation {autoMode ? 'on' : 'off'}</button>
    </div>

    <section className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Provider health</p><p className="mt-2 text-2xl font-semibold">{configuredCount}/{providers.length}</p><p className="mt-1 text-sm text-muted-foreground">Configured adapters</p></div><div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Automation mode</p><p className="mt-2 text-2xl font-semibold">{autoMode ? 'Active' : 'Manual'}</p><p className="mt-1 text-sm text-muted-foreground">Owner-controlled</p></div><div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Test lab</p><p className="mt-2 text-2xl font-semibold">Safe</p><p className="mt-1 text-sm text-muted-foreground">Live changes require approval</p></div></section>

    <section className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /><h3 className="font-semibold">Add feature with AI</h3></div><p className="mt-2 text-sm text-muted-foreground">Describe a business capability and generate a safe proposal with data, API, permissions, and test steps.</p><div className="mt-4 flex flex-col gap-3 sm:flex-row"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Add an invoice approval workflow for managers" className="min-h-24 flex-1 resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" /><button type="button" onClick={generateFeature} className="h-fit rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"><WandSparkles className="mr-2 inline size-4" />Generate</button></div>{message && <p className="mt-3 text-sm text-muted-foreground" role="status">{message}</p>}</section>

    <section className="grid gap-4 md:grid-cols-2">{modules.map((module) => <article key={module.name} className="rounded-2xl border border-border bg-card p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold">{module.name}</h3><p className="mt-2 text-sm text-muted-foreground">{module.description}</p></div><span className={`rounded-full px-2.5 py-1 text-xs ${module.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>{module.status}</span></div><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => run(module.name)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"><Play className="size-3" />{module.action}</button><button type="button" onClick={() => setMessage(`${module.name} health check queued.`)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium"><RefreshCw className="size-3" />Check health</button>{(module.status === 'Review' || activeModule === module.name) && <button type="button" onClick={() => setMessage(`${module.name} repair plan queued for review.`)} className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 px-3 py-2 text-xs font-medium text-amber-600"><AlertTriangle className="size-3" />Master fix</button>}</div></article>)}</section>

    <section className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center gap-2"><KeyRound className="size-4 text-primary" /><h3 className="font-semibold">Provider connection checklist</h3></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{providers.map(([name, description], index) => <div key={name} className="flex items-start justify-between gap-4 rounded-xl border border-border p-4"><div><p className="font-medium">{name}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>{index < 2 ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" /> : <span className="text-xs text-muted-foreground">Settings</span>}</div>)}</div><a href="/settings" className="mt-4 inline-flex rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent">Manage connections</a></section>
  </div>
}
