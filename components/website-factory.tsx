'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowUpRight, CheckCircle2, Loader2, Sparkles, XCircle } from 'lucide-react'

const stages = ['PROMPT', 'REQUIREMENTS', 'SITE_PLAN', 'BRAND_SYSTEM', 'PAGE_PLAN', 'COMPONENT_PLAN', 'CODE', 'DATABASE', 'API', 'TEST', 'PREVIEW', 'DEPLOY']
type Build = { id: string; status: string; stage: string; progress: number; currentStep?: string | null; error?: string | null; project?: { id: string; name: string } }

export function WebsiteFactory() {
  const [prompt, setPrompt] = useState('')
  const [projectName, setProjectName] = useState('')
  const [build, setBuild] = useState<Build | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!build?.id || ['COMPLETED', 'FAILED', 'DEPLOYED'].includes(build.status)) return
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/website-factory/build/${build.id}`)
      if (response.ok) setBuild((await response.json()).build)
    }, 2000)
    return () => window.clearInterval(timer)
  }, [build?.id, build?.status])

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    const response = await fetch('/api/website-factory/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, projectName: projectName || undefined }) })
    const data = await response.json().catch(() => ({}))
    setBusy(false)
    if (!response.ok) return setError(data.error || 'Unable to queue website build.')
    setBuild({ id: data.buildId, status: data.status, stage: data.stage, progress: data.progress, project: { id: data.projectId, name: projectName || 'AI Website Project' } })
  }

  const stageIndex = build ? stages.indexOf(build.stage) : -1
  return <div className="space-y-8">
    <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Autonomous production</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Website Factory</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Turn a natural-language brief into an original, tested, previewable website build with durable checkpoints and verified deployment gates.</p></div>
    <form onSubmit={submit} className="rounded-2xl border border-primary/25 bg-primary/5 p-6"><div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /><h3 className="font-semibold">Build with AI</h3></div><p className="mt-2 text-sm text-muted-foreground">Describe the business, visual direction, pages, forms, data, integrations, and responsive behavior. Reference URLs or designs are used as inspiration, never copied.</p><input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Project name (optional)" className="mt-5 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring" /><textarea required minLength={20} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Build a modern luxury real estate website for a Lagos property company. Use black, white and gold. Include Home, Properties, Property Details, About, Contact, Agents and Blog. Add property search and inquiry forms." className="mt-3 min-h-36 w-full resize-y rounded-xl border border-border bg-background p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring" /><button disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}Build website</button>{error && <p className="mt-3 text-sm text-destructive">{error}</p>}</form>
    {build && <section className="rounded-2xl border border-border bg-card p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Build {build.id.slice(-8)}</p><h3 className="mt-1 text-lg font-semibold">{build.currentStep || build.stage}</h3><p className="mt-1 text-sm text-muted-foreground">{build.status}</p></div>{build.project && <Link href={`/website-factory/${build.project.id}`} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium">Open project <ArrowUpRight className="size-3.5" /></Link>}</div><div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${build.progress}%` }} /></div><div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">{stages.map((stage, index) => { const complete = index < stageIndex || build.status === 'COMPLETED' || build.status === 'DEPLOYED'; const active = stage === build.stage; return <div key={stage} className={`flex items-center gap-2 rounded-lg border p-3 text-xs ${active ? 'border-primary bg-primary/10' : 'border-border'}`}>{complete ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : active ? <Loader2 className="size-3.5 animate-spin text-primary" /> : <XCircle className="size-3.5 text-muted-foreground/40" />}<span>{stage.replaceAll('_', ' ')}</span></div> })}</div>{build.error && <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{build.error}</p>}</section>}
  </div>
}
