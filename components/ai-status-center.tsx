'use client'

import { useEffect, useState } from 'react'
import { Activity, CheckCircle2, CircleAlert, KeyRound, Loader2, Plus, RefreshCw, Save, ShieldCheck, XCircle } from 'lucide-react'
import { AI_CAPABILITIES } from '@/lib/ai-gateway/capabilities'

type Provider = {
  id: string
  key: string
  name: string
  kind: string
  status: string
  baseUrl: string | null
  capabilities: string[]
  priority: number
  fallbackPriority: number
  maxSpend: number | null
  dailyLimit: number | null
  monthlyLimit: number | null
  circuitState: string
  consecutiveFailures: number
  lastSuccessAt: string | null
  lastFailureAt: string | null
  quota: Record<string, unknown> | null
  credentialConfigured: boolean
  credentialFingerprint?: string
  health: { status: string; latencyMs: number | null; errorCode: string | null; message: string | null; checkedAt: string } | null
  models: { id: string; key: string; name: string; contextWindow: number | null; inputCostPerMillion: number | null; outputCostPerMillion: number | null; status: string }[]
}

type FormState = {
  key: string; name: string; kind: string; baseUrl: string; apiKey: string; capabilities: string[]; priority: string; fallbackPriority: string; maxSpend: string; dailyLimit: string; monthlyLimit: string; modelKey: string; modelName: string; inputCost: string; outputCost: string
}

const emptyForm: FormState = { key: '', name: '', kind: 'OPENAI_COMPATIBLE', baseUrl: 'https://api.openai.com/v1', apiKey: '', capabilities: ['TEXT_GENERATION'], priority: '100', fallbackPriority: '100', maxSpend: '', dailyLimit: '', monthlyLimit: '', modelKey: '', modelName: '', inputCost: '', outputCost: '' }

function date(value: string | null) { return value ? new Date(value).toLocaleString() : 'Never' }
function number(value: number | null) { return value === null ? 'Unlimited' : `$${value.toFixed(4)}` }

export function AiStatusCenter() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [usage, setUsage] = useState<any[]>([])
  const [costs, setCosts] = useState<any[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const [providerResponse, usageResponse, costResponse] = await Promise.all([fetch('/api/ai/providers'), fetch('/api/ai/usage'), fetch('/api/ai/costs')])
    if (providerResponse.ok) setProviders(await providerResponse.json())
    if (usageResponse.ok) setUsage((await usageResponse.json()).usage || [])
    if (costResponse.ok) setCosts((await costResponse.json()).costs || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((current) => ({ ...current, [key]: value })) }
  function toggleCapability(capability: string) { setField('capabilities', form.capabilities.includes(capability) ? form.capabilities.filter((item) => item !== capability) : [...form.capabilities, capability]) }

  function edit(provider: Provider) {
    const model = provider.models[0]
    setEditingId(provider.id)
    setForm({ ...emptyForm, key: provider.key, name: provider.name, kind: provider.kind, baseUrl: provider.baseUrl || '', capabilities: provider.capabilities, priority: String(provider.priority), fallbackPriority: String(provider.fallbackPriority), maxSpend: provider.maxSpend?.toString() || '', dailyLimit: provider.dailyLimit?.toString() || '', monthlyLimit: provider.monthlyLimit?.toString() || '', modelKey: model?.key || '', modelName: model?.name || '', inputCost: model?.inputCostPerMillion?.toString() || '', outputCost: model?.outputCostPerMillion?.toString() || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true); setMessage('')
    const body = { key: form.key, name: form.name, kind: form.kind, baseUrl: form.baseUrl, ...(editingId ? {} : { apiKey: form.apiKey }), ...(editingId && form.apiKey ? { apiKey: form.apiKey } : {}), capabilities: form.capabilities, priority: Number(form.priority), fallbackPriority: Number(form.fallbackPriority), maxSpend: form.maxSpend ? Number(form.maxSpend) : null, dailyLimit: form.dailyLimit ? Number(form.dailyLimit) : null, monthlyLimit: form.monthlyLimit ? Number(form.monthlyLimit) : null, model: form.modelKey ? { key: form.modelKey, name: form.modelName || form.modelKey, inputCostPerMillion: form.inputCost ? Number(form.inputCost) : null, outputCostPerMillion: form.outputCost ? Number(form.outputCost) : null } : undefined }
    const response = await fetch(editingId ? `/api/ai/providers/${editingId}` : '/api/ai/providers', { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await response.json().catch(() => ({}))
    setSaving(false)
    if (!response.ok) return setMessage(data.error || 'Unable to save provider.')
    setMessage(editingId ? 'Provider updated. The submitted key was encrypted server-side.' : 'Provider added. The API key was encrypted and will never be displayed.')
    setEditingId(null); setForm(emptyForm); await load()
  }

  async function toggle(provider: Provider) {
    const response = await fetch(`/api/ai/providers/${provider.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: provider.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED' }) })
    if (response.ok) await load()
  }

  async function test(provider: Provider, model?: string) {
    setTesting(provider.id); setMessage(`Testing ${provider.name}...`)
    const response = await fetch(`/api/ai/providers/${provider.id}/test`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ capability: provider.capabilities[0] || 'TEXT_GENERATION', model }) })
    const data = await response.json().catch(() => ({}))
    setTesting(null); setMessage(response.ok ? `${provider.name} responded in ${data.latencyMs}ms using ${data.model}.` : data.error || 'Provider test failed.')
    await load()
  }

  return <div className="space-y-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">AI operations</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">AI Status</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Route requests by capability, health, limits, priority, and legitimate provider availability.</p></div><button type="button" onClick={() => load()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium"><RefreshCw className="size-4" />Refresh status</button></div>

    <section className="grid gap-4 sm:grid-cols-4"><div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Providers</p><p className="mt-2 text-2xl font-semibold">{providers.filter((provider) => provider.circuitState !== 'DISABLED').length}</p><p className="mt-1 text-sm text-muted-foreground">Enabled registry entries</p></div><div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Healthy</p><p className="mt-2 text-2xl font-semibold">{providers.filter((provider) => provider.health?.status === 'HEALTHY').length}</p><p className="mt-1 text-sm text-muted-foreground">Last recorded checks</p></div><div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Tasks logged</p><p className="mt-2 text-2xl font-semibold">{usage.length}</p><p className="mt-1 text-sm text-muted-foreground">Recent provider attempts</p></div><div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Recent cost</p><p className="mt-2 text-2xl font-semibold">${costs.reduce((sum, item) => sum + Number(item.amount || 0), 0).toFixed(4)}</p><p className="mt-1 text-sm text-muted-foreground">Recorded provider spend</p></div></section>

    <form onSubmit={save} className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center justify-between gap-4"><div><div className="flex items-center gap-2"><KeyRound className="size-4 text-primary" /><h3 className="font-semibold">{editingId ? 'Edit provider' : 'Add AI provider'}</h3></div><p className="mt-2 text-sm text-muted-foreground">Keys are submitted over the authenticated API, encrypted with AES-GCM, and never returned.</p></div>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm) }} className="inline-flex items-center gap-2 text-sm text-muted-foreground"><XCircle className="size-4" />Cancel</button>}</div><div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3"><label className="text-xs text-muted-foreground">Provider key<input required disabled={Boolean(editingId)} value={form.key} onChange={(event) => setField('key', event.target.value)} placeholder="openai-main" className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="text-xs text-muted-foreground">Provider name<input required value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="OpenAI production" className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="text-xs text-muted-foreground">Provider type<input required value={form.kind} onChange={(event) => setField('kind', event.target.value)} placeholder="OPENAI_COMPATIBLE" className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="text-xs text-muted-foreground md:col-span-2">Endpoint / base URL<input required value={form.baseUrl} onChange={(event) => setField('baseUrl', event.target.value)} placeholder="https://api.openai.com/v1" className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="text-xs text-muted-foreground">API key{editingId && <span className="ml-1">(leave blank to keep current)</span>}<input required={!editingId} type="password" value={form.apiKey} onChange={(event) => setField('apiKey', event.target.value)} autoComplete="new-password" placeholder={editingId ? 'Stored securely' : 'Paste once, never displayed'} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="text-xs text-muted-foreground">Model key<input value={form.modelKey} onChange={(event) => setField('modelKey', event.target.value)} placeholder="gpt-4o-mini" className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="text-xs text-muted-foreground">Model name<input value={form.modelName} onChange={(event) => setField('modelName', event.target.value)} placeholder="GPT-4o Mini" className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="text-xs text-muted-foreground">Priority<input type="number" min="1" value={form.priority} onChange={(event) => setField('priority', event.target.value)} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="text-xs text-muted-foreground">Fallback priority<input type="number" min="1" value={form.fallbackPriority} onChange={(event) => setField('fallbackPriority', event.target.value)} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="text-xs text-muted-foreground">Maximum spend<input type="number" min="0" step="0.0001" value={form.maxSpend} onChange={(event) => setField('maxSpend', event.target.value)} placeholder="Unlimited" className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="text-xs text-muted-foreground">Daily limit<input type="number" min="0" step="0.0001" value={form.dailyLimit} onChange={(event) => setField('dailyLimit', event.target.value)} placeholder="Unlimited" className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="text-xs text-muted-foreground">Monthly limit<input type="number" min="0" step="0.0001" value={form.monthlyLimit} onChange={(event) => setField('monthlyLimit', event.target.value)} placeholder="Unlimited" className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="text-xs text-muted-foreground">Input $ / 1M tokens<input type="number" min="0" step="0.000001" value={form.inputCost} onChange={(event) => setField('inputCost', event.target.value)} placeholder="0" className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="text-xs text-muted-foreground">Output $ / 1M tokens<input type="number" min="0" step="0.000001" value={form.outputCost} onChange={(event) => setField('outputCost', event.target.value)} placeholder="0" className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label></div><div className="mt-5"><p className="text-xs text-muted-foreground">Capabilities</p><div className="mt-2 flex flex-wrap gap-2">{AI_CAPABILITIES.map((capability) => <button type="button" key={capability} onClick={() => toggleCapability(capability)} className={`rounded-full border px-3 py-1.5 text-xs ${form.capabilities.includes(capability) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{capability}</button>)}</div></div><div className="mt-5 flex items-center gap-3"><button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">{saving ? <Loader2 className="size-4 animate-spin" /> : editingId ? <Save className="size-4" /> : <Plus className="size-4" />}{editingId ? 'Save provider' : 'Add provider'}</button>{message && <p className="text-sm text-muted-foreground" role="status">{message}</p>}</div></form>

    <section><div className="mb-4 flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /><h3 className="font-semibold">Provider capability matrix</h3></div>{loading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Loading registry...</div> : providers.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-8 text-sm text-muted-foreground">No providers configured. Add a real provider above to enable gateway execution.</div> : <div className="grid gap-4 lg:grid-cols-2">{providers.map((provider) => <article key={provider.id} className="rounded-2xl border border-border bg-card p-5"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h4 className="font-semibold">{provider.name}</h4>{provider.health?.status === 'HEALTHY' ? <CheckCircle2 className="size-4 text-emerald-500" /> : <CircleAlert className="size-4 text-amber-500" />}</div><p className="mt-1 text-xs text-muted-foreground">{provider.kind} · {provider.key} · priority {provider.priority} / fallback {provider.fallbackPriority}</p></div><span className={`rounded-full px-2.5 py-1 text-xs ${provider.status === 'DISABLED' ? 'bg-slate-500/10 text-slate-600' : provider.circuitState === 'CLOSED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>{provider.status === 'DISABLED' ? 'DISABLED' : provider.circuitState}</span></div><div className="mt-4 flex flex-wrap gap-1.5">{provider.capabilities.map((capability) => <span key={capability} className="rounded-full bg-secondary px-2 py-1 text-[10px] text-secondary-foreground">{capability}</span>)}</div><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><p className="text-muted-foreground">Latency</p><p className="mt-1 font-medium">{provider.health?.latencyMs ?? 'N/A'} ms</p></div><div><p className="text-muted-foreground">Credential</p><p className="mt-1 font-medium">{provider.credentialConfigured ? `Encrypted · ${provider.credentialFingerprint}` : 'Missing'}</p></div><div><p className="text-muted-foreground">Last success</p><p className="mt-1 font-medium">{date(provider.lastSuccessAt)}</p></div><div><p className="text-muted-foreground">Last failure</p><p className="mt-1 font-medium">{date(provider.lastFailureAt)}</p></div><div><p className="text-muted-foreground">Spending limits</p><p className="mt-1 font-medium">{number(provider.dailyLimit)} / {number(provider.monthlyLimit)}</p></div><div><p className="text-muted-foreground">Quota</p><p className="mt-1 font-medium">{provider.quota ? JSON.stringify(provider.quota) : 'Provider does not expose quota'}</p></div></div><div className="mt-4 space-y-2">{provider.models.map((model) => <div key={model.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs"><span>{model.name} <span className="text-muted-foreground">({model.key})</span></span><button type="button" onClick={() => test(provider, model.key)} disabled={testing === provider.id || provider.status === 'DISABLED'} className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 font-medium"><Activity className="size-3" />Test model</button></div>)}</div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => test(provider)} disabled={testing === provider.id || provider.status === 'DISABLED'} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">{testing === provider.id ? <Loader2 className="size-3 animate-spin" /> : <Activity className="size-3" />}Test connection</button><button type="button" onClick={() => edit(provider)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium">Edit</button><button type="button" onClick={() => toggle(provider)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium">{provider.status === 'DISABLED' ? 'Enable' : 'Disable'}</button></div>{provider.health?.message && <p className="mt-3 text-xs text-amber-600">{provider.health.errorCode}: {provider.health.message}</p>}</article>)}</div>}</section>

    <section className="grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border border-border bg-card p-5"><h3 className="font-semibold">Recent provider usage</h3><div className="mt-4 space-y-3">{usage.length ? usage.slice(0, 8).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 text-xs"><span>{item.provider?.name || item.providerId} · {item.model?.name || 'model'}</span><span className={item.status === 'SUCCEEDED' ? 'text-emerald-600' : 'text-amber-600'}>{item.status} · {item.durationMs || 0}ms</span></div>) : <p className="text-sm text-muted-foreground">No provider attempts recorded.</p>}</div></div><div className="rounded-2xl border border-border bg-card p-5"><h3 className="font-semibold">Recent estimated costs</h3><div className="mt-4 space-y-3">{costs.length ? costs.slice(0, 8).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 text-xs"><span>{item.provider?.name || item.providerId} · {item.model?.name || 'model'}</span><span>${Number(item.amount || 0).toFixed(6)} {item.currency}</span></div>) : <p className="text-sm text-muted-foreground">No cost records yet. Costs are estimates based on configured model pricing.</p>}</div></div></section>
  </div>
}
