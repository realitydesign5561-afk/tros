'use client'

import { Sparkles } from 'lucide-react'
import { useState } from 'react'

export function FeatureBuilder() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  async function generate() {
    if (!prompt.trim()) return
    setLoading(true)
    const response = await fetch('/api/admin/feature-proposal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
    const data = await response.json()
    setResult(response.ok ? `${data.proposal.title}: ${data.proposal.page} with ${data.proposal.table} and ${data.proposal.api}.` : data.error ?? 'Unable to generate proposal.')
    setLoading(false)
  }
  return <section className="rounded-2xl border border-primary/25 bg-primary/5 p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2"><div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-4" /></div><div><h2 className="font-semibold">Build TROS with a prompt</h2><p className="text-xs text-muted-foreground">Generate a safe feature proposal without leaving the app.</p></div></div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) generate() }} placeholder="Add invoicing, a client portal, or a new dashboard" className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring" /><button type="button" disabled={loading} onClick={generate} className="h-12 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{loading ? 'Thinking…' : 'Generate'}</button></div>{result && <p className="mt-3 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">{result}</p>}</section>
}
