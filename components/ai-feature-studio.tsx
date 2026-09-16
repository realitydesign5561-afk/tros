'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Pencil, Play, Plus, Sparkles, Trash2, X } from 'lucide-react'

type AiFeature = { id: string; name: string; description: string | null; prompt: string; provider: string; status: string; externalUrl: string | null }

const providers = [
  { id: 'lovable', label: 'Lovable.dev', build: (prompt: string) => `https://lovable.dev/?prompt=${encodeURIComponent(prompt)}` },
  { id: 'copilot', label: 'GitHub Copilot', build: () => 'https://github.com/copilot' },
  { id: 'custom', label: 'Custom / manual', build: () => '' },
]

const emptyForm = { id: '', name: '', description: '', prompt: '', provider: 'copilot', externalUrl: '' }

export function AiFeatureStudio() {
  const [features, setFeatures] = useState<AiFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    const response = await fetch('/api/ai-features')
    const data = await response.json()
    setFeatures(response.ok ? data.features : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function providerLink(feature: Pick<AiFeature, 'provider' | 'prompt' | 'externalUrl'>) {
    if (feature.externalUrl) return feature.externalUrl
    return providers.find((item) => item.id === feature.provider)?.build(feature.prompt) || ''
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!form.name.trim() || !form.prompt.trim()) return setMessage('Name and prompt are required.')
    const method = editing ? 'PATCH' : 'POST'
    const response = await fetch('/api/ai-features', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (!response.ok) return setMessage('Unable to save the feature.')
    setMessage(editing ? 'Feature updated.' : 'Feature added as a draft.')
    setForm(emptyForm)
    setEditing(false)
    load()
  }

  async function setStatus(id: string, status: string) {
    await fetch('/api/ai-features', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    load()
  }

  async function remove(id: string) {
    await fetch(`/api/ai-features?id=${id}`, { method: 'DELETE' })
    load()
  }

  function edit(feature: AiFeature) {
    setForm({ id: feature.id, name: feature.name, description: feature.description || '', prompt: feature.prompt, provider: feature.provider, externalUrl: feature.externalUrl || '' })
    setEditing(true)
  }

  return <div className="space-y-8">
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Feature control</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">AI & automation features</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Add, edit, and activate features by describing them here, then hand the prompt off to Lovable.dev or GitHub Copilot to implement.</p>
    </div>

    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-primary/25 bg-primary/5 p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2"><div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-4" /></div><div><h3 className="font-semibold">{editing ? 'Edit feature' : 'Add a new feature'}</h3><p className="text-xs text-muted-foreground">Draft, refine, then activate when it is ready.</p></div>{editing && <button type="button" onClick={() => { setForm(emptyForm); setEditing(false) }} className="ml-auto flex size-8 items-center justify-center rounded-lg border border-border"><X className="size-4" /></button>}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Feature name" className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <select value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value })} className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring">
          {providers.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </div>
      <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Short description (optional)" className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
      <textarea required value={form.prompt} onChange={(event) => setForm({ ...form, prompt: event.target.value })} placeholder="Describe what this feature should do, e.g. 'Add a client referral tracker with a dashboard widget'" className="min-h-24 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
      <input value={form.externalUrl} onChange={(event) => setForm({ ...form, externalUrl: event.target.value })} placeholder="External build link (optional, overrides the default provider link)" className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
      <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"><Plus className="size-4" />{editing ? 'Save changes' : 'Add feature'}</button>
      {message && <p className="text-sm text-muted-foreground" role="status">{message}</p>}
    </form>

    <section className="space-y-3">
      {loading && <p className="text-sm text-muted-foreground">Loading features…</p>}
      {!loading && features.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No features yet. Add one above to get started.</p>}
      {features.map((feature) => {
        const link = providerLink(feature)
        return <article key={feature.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2"><h3 className="font-semibold">{feature.name}</h3><span className={`rounded-full px-2.5 py-0.5 text-xs ${feature.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : feature.status === 'DISABLED' ? 'bg-muted text-muted-foreground' : 'bg-amber-500/10 text-amber-600'}`}>{feature.status}</span></div>
              {feature.description && <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>}
              <p className="mt-2 rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">{feature.prompt}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {link && <a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent"><ExternalLink className="size-3" />Open in {providers.find((item) => item.id === feature.provider)?.label ?? 'tool'}</a>}
              <button type="button" onClick={() => edit(feature)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent"><Pencil className="size-3" />Edit</button>
              {feature.status !== 'ACTIVE' ? <button type="button" onClick={() => setStatus(feature.id, 'ACTIVE')} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"><Play className="size-3" />Activate</button> : <button type="button" onClick={() => setStatus(feature.id, 'DISABLED')} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium">Deactivate</button>}
              <button type="button" onClick={() => remove(feature.id)} className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive"><Trash2 className="size-3" />Delete</button>
            </div>
          </div>
        </article>
      })}
    </section>
  </div>
}
