'use client'

import { useState } from 'react'
import { Activity, Cloud, Globe2, GitBranch, Loader2, Plus, RefreshCw } from 'lucide-react'

export function ProjectOperations({ projectId }: { projectId: string }) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  async function run(action: 'import' | 'deploy' | 'domain' | 'management') {
    setBusy(action); setMessage('')
    const response = await fetch('/api/website-factory/project', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, action, value: value || undefined }) })
    const data = await response.json()
    setMessage(data.message || data.error || 'Operation complete.')
    if (response.ok && action !== 'management') setValue('')
    setBusy(null)
  }
  return <section className="rounded-xl border border-border bg-card p-6">
    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Operations</p><h3 className="mt-2 text-lg font-semibold">Launch and manage this project</h3><p className="mt-1 text-sm text-muted-foreground">OAuth actions stay server-side. TROS records each state in SQLite.</p></div><span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"><Activity className="size-3.5" /> Monitoring ready</span></div>
    <div className="mt-6 grid gap-3 md:grid-cols-2">
      <button onClick={() => run('deploy')} disabled={busy !== null} className="flex items-center gap-3 rounded-lg border border-border p-4 text-left transition hover:border-primary disabled:opacity-60"><Cloud className="size-4 text-primary" /><span><span className="block text-sm font-medium">Deploy on Vercel</span><span className="block text-xs text-muted-foreground">Queue deployment and attach status monitoring</span></span>{busy === 'deploy' && <Loader2 className="ml-auto size-4 animate-spin" />}</button>
      <button onClick={() => run('import')} disabled={busy !== null || !value} className="flex items-center gap-3 rounded-lg border border-border p-4 text-left transition hover:border-primary disabled:opacity-60"><GitBranch className="size-4 text-primary" /><span><span className="block text-sm font-medium">Import GitHub repository</span><span className="block text-xs text-muted-foreground">Paste a repository URL below</span></span>{busy === 'import' && <Loader2 className="ml-auto size-4 animate-spin" />}</button>
      <button onClick={() => run('domain')} disabled={busy !== null || !value} className="flex items-center gap-3 rounded-lg border border-border p-4 text-left transition hover:border-primary disabled:opacity-60"><Globe2 className="size-4 text-primary" /><span><span className="block text-sm font-medium">Attach custom domain</span><span className="block text-xs text-muted-foreground">Paste a domain below to create a pending binding</span></span>{busy === 'domain' && <Loader2 className="ml-auto size-4 animate-spin" />}</button>
      <button onClick={() => run('management')} disabled={busy !== null || !value} className="flex items-center gap-3 rounded-lg border border-border p-4 text-left transition hover:border-primary disabled:opacity-60"><Plus className="size-4 text-primary" /><span><span className="block text-sm font-medium">Add management log</span><span className="block text-xs text-muted-foreground">Maintenance, retainer, or billing note</span></span>{busy === 'management' && <Loader2 className="ml-auto size-4 animate-spin" />}</button>
    </div>
    <div className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Repository URL, domain, or management note" className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" /><button onClick={() => { setValue(''); setMessage('Status refresh queued.'); }} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-accent"><RefreshCw className="size-4" /> Refresh</button></div>
    {message && <p className="mt-4 rounded-lg border border-border bg-accent/50 px-4 py-3 text-sm text-muted-foreground">{message}</p>}
  </section>
}
