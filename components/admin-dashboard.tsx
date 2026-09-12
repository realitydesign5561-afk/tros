'use client'

import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Download, HeartPulse } from 'lucide-react'
import { FeatureBuilder } from '@/components/feature-builder'

type Overview = { metrics: { projects: number; posts: number; leads: number; revenue: number }; health: { workflows: number; activeRuns: number; keys: { provider: string; label: string; configured: boolean }[] } }
const chartData = [{ name: 'Websites', value: 12 }, { name: 'Posts', value: 28 }, { name: 'Leads', value: 46 }, { name: 'Revenue', value: 72 }]

export function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null)
  useEffect(() => { fetch('/api/admin/overview').then((response) => response.json()).then(setOverview) }, [])
  const cards = overview ? [['Websites', overview.metrics.projects], ['Posts', overview.metrics.posts], ['Leads', overview.metrics.leads], ['Revenue', `$${(overview.metrics.revenue / 100).toFixed(2)}`]] : []
  return <div className="space-y-8">
    <div><p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">System control</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Admin command center</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Turn ideas into reviewable build plans, monitor the operating system, and export a local backup.</p></div>
    <FeatureBuilder />
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value]) => <div key={String(label)} className="rounded-xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p></div>)}</section>
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]"><section className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center justify-between"><div><h3 className="font-semibold">Operating analytics</h3><p className="mt-1 text-sm text-muted-foreground">Current inventory across core modules.</p></div><span className="text-xs text-muted-foreground">Live snapshot</span></div><div className="mt-6 h-64"><AreaChart width={700} height={240} data={chartData} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.16)" strokeWidth={2} /></AreaChart></div></section><section className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center gap-2"><HeartPulse className="size-4 text-primary" /><h3 className="font-semibold">System health</h3></div><div className="mt-5 space-y-4 text-sm">{overview?.health.keys.length ? overview.health.keys.map((key: Overview['health']['keys'][number]) => <div key={key.provider} className="flex items-center justify-between"><span>{key.label}</span><span className="text-emerald-500">Configured</span></div>) : <div className="flex justify-between"><span>API keys</span><span className="text-amber-500">No keys stored</span></div>}<div className="flex justify-between"><span>Automation runs</span><span>{overview?.health.activeRuns ?? 0} active</span></div><div className="flex justify-between"><span>Disk usage</span><span className="text-muted-foreground">Local SQLite</span></div></div><a href="/api/admin/backup" className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium hover:bg-accent"><Download className="size-4" />Download SQLite backup</a><p className="mt-3 text-xs text-muted-foreground">Google Drive is not connected; the backup downloads locally instead.</p></section></div>
  </div>
}
