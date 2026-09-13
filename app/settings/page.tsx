'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { AuthGuard } from '@/components/auth-guard'

const providerList = ['Vercel AI Gateway', 'Activepieces', 'v0', 'Lovable', 'Bolt', 'Gemini', 'Pinterest references', 'Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'YouTube', 'Email', 'WhatsApp']

export default function SettingsPage() {
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const [provider, setProvider] = useState('')
  const [value, setValue] = useState('')

  async function savePassword(event: React.FormEvent) {
    event.preventDefault()
    const response = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
    setMessage(response.ok ? 'Password updated.' : 'Unable to update password.')
    setPassword('')
  }

  async function saveKey(event: React.FormEvent) {
    event.preventDefault()
    const response = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, value, label: provider }) })
    setMessage(response.ok ? 'Connection saved securely.' : 'Unable to save connection.')
    setValue('')
  }

  return <AuthGuard><DashboardShell><div className="max-w-4xl space-y-6"><div><h2 className="text-2xl font-semibold tracking-tight">Settings</h2><p className="mt-2 text-sm text-muted-foreground">Connect the services that power your business automation.</p></div><div className="grid gap-6 md:grid-cols-2"><form onSubmit={savePassword} className="space-y-4 rounded-xl border border-border bg-card p-5"><div><h3 className="font-medium">Admin password</h3><p className="mt-1 text-xs text-muted-foreground">Set a new password for your admin account.</p></div><input required minLength={8} type="password" placeholder="New password" value={password} onChange={event=>setPassword(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /><button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Update password</button></form><form onSubmit={saveKey} className="space-y-4 rounded-xl border border-border bg-card p-5"><div><h3 className="font-medium">Provider connection</h3><p className="mt-1 text-xs text-muted-foreground">Keys are submitted through the existing secure settings endpoint.</p></div><select required value={provider} onChange={event=>setProvider(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Select a provider</option>{providerList.map(item=><option key={item} value={item}>{item}</option>)}</select><input required type="password" placeholder="API key or connection token" value={value} onChange={event=>setValue(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /><button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Save connection</button></form></div><section className="rounded-xl border border-border bg-card p-5"><h3 className="font-medium">Provider checklist</h3><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{providerList.map(item=><div key={item} className="rounded-lg border border-border px-3 py-3 text-sm"><p>{item}</p><p className="mt-1 text-xs text-muted-foreground">Add credentials above to activate</p></div>)}</div></section>{message && <p className="text-sm text-muted-foreground" role="status">{message}</p>}</div></DashboardShell></AuthGuard>
}
