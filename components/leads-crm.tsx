'use client'

import { useState } from 'react'
import { Search, Sparkles, Users, Send, MapPin } from 'lucide-react'

const columns = [{ id: 'NEW', label: 'New' }, { id: 'RESEARCHED', label: 'Researched' }, { id: 'CONTACTED', label: 'Contacted' }, { id: 'QUALIFIED', label: 'Qualified' }]

export function LeadsCrm({ initialLeads }: { initialLeads: any[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const [niche, setNiche] = useState('creative agencies')
  const [location, setLocation] = useState('Austin, TX')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  async function findLeads() {
    setBusy(true)
    setNotice('')
    try {
      const response = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ niche, location }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to find leads.')
      setLeads((current) => [...data.leads, ...current])
      setNotice(`${data.leads.length} research-ready leads saved.`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to find leads.')
    } finally {
      setBusy(false)
    }
  }

  async function moveLead(id: string, status: string) {
    const response = await fetch('/api/leads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (!response.ok) { setNotice('Unable to update lead status.'); return }
    setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, status } : lead))
  }

  async function generateOutreach(id: string) {
    const response = await fetch('/api/leads/outreach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: id }) })
    const data = await response.json()
    setNotice(response.ok ? (data.delivery === 'DRAFT_ONLY' ? 'Draft created. Connect email to send.' : 'Outreach sent.') : (data.error || 'Unable to create outreach.'))
  }

  return <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Module 8 / Lead engine</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Lead Gen + Outreach</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Find, research, and move your best-fit prospects through one calm CRM workspace.</p></div>
        <a href="/leads/campaigns" className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Campaigns</a>
      </header>
      <section className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
        <label className="flex min-w-52 flex-1 flex-col gap-2 text-xs text-muted-foreground">Niche<input value={niche} onChange={(event) => setNiche(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
        <label className="flex min-w-52 flex-1 flex-col gap-2 text-xs text-muted-foreground">Location<input value={location} onChange={(event) => setLocation(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
        <button onClick={findLeads} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"><Search className="size-4" />{busy ? 'Finding...' : 'Find 5 leads'}</button>
      </section>
      {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
      <section className="grid gap-4 xl:grid-cols-4">
        {columns.map((column) => <div key={column.id} className="min-h-72 rounded-2xl border border-border bg-card p-3"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-medium">{column.label}</h2><span className="font-mono text-xs text-muted-foreground">{leads.filter((lead) => lead.status === column.id).length}</span></div><div className="flex flex-col gap-3">{leads.filter((lead) => lead.status === column.id).map((lead) => <article key={lead.id} className="rounded-xl border border-border bg-background p-3"><div className="flex items-start justify-between gap-2"><div><h3 className="text-sm font-medium">{lead.company || lead.name}</h3><p className="text-xs text-muted-foreground">{lead.name}</p></div><Users className="size-4 text-muted-foreground" /></div><p className="mt-3 text-xs leading-5 text-muted-foreground">{lead.painPoints}</p><div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="size-3" />{lead.location}</div><div className="mt-3 flex gap-2"><button onClick={() => generateOutreach(lead.id)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs hover:bg-muted"><Sparkles className="size-3" />Draft</button><select value={lead.status} onChange={(event) => moveLead(lead.id, event.target.value)} className="rounded-md border border-border bg-background px-2 text-xs"><option value="NEW">New</option><option value="RESEARCHED">Research</option><option value="CONTACTED">Contacted</option><option value="QUALIFIED">Qualified</option></select></div></article>)}</div></div>)}
      </section>
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Send className="size-3" />Resend sandbox mode: messages are drafted locally unless a verified test recipient is configured.</div>
    </div>
  </div>
}
