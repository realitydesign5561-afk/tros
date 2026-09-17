'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Bot, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl: '/',
    })
    if (!result || result.error || !result.ok) {
      setError('Invalid credentials')
      setLoading(false)
      return
    }
    router.replace('/')
    router.refresh()
  }
  return <main className="grid min-h-screen bg-background lg:grid-cols-[1.1fr_0.9fr]"><section className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between"><div className="absolute -right-24 top-16 size-96 rounded-full border-[42px] border-accent/20" /><div className="relative flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Bot className="size-5" /></div><span className="font-mono text-sm tracking-[0.2em]">TROS / 01</span></div><div className="relative max-w-xl"><p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary-foreground/50">Reality operations system</p><h1 className="mt-6 text-6xl font-extrabold leading-[0.98] tracking-tight">Build the reality you want to run.</h1><p className="mt-6 max-w-md text-sm leading-6 text-primary-foreground/65">One focused command center for websites, workflows, content, leads, and the ideas in between.</p></div><div className="relative flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary-foreground/50"><span className="size-2 rounded-full bg-emerald-400" />System ready / secure workspace</div></section><section className="flex items-center justify-center px-6 py-10"><div className="w-full max-w-sm"><div className="mb-8"><div className="flex items-center gap-3 lg:hidden"><div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Bot className="size-5" /></div><span className="font-mono text-sm tracking-[0.2em]">TROS / 01</span></div><p className="mt-10 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Private workspace</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight">Welcome back.</h2><p className="mt-2 text-sm text-muted-foreground">Sign in to your operations center.</p></div><form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-primary/5 sm:p-8"><label className="block space-y-2 text-sm"><span className="font-semibold">Email</span><input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring" /></label><label className="block space-y-2 text-sm"><span className="font-semibold">Password</span><input value={password} onChange={e => setPassword(e.target.value)} type="password" className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>{error && <p className="text-sm text-destructive">{error}</p>}<button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">{loading && <Loader2 className="size-4 animate-spin" />}Enter workspace <ArrowUpRight className="size-4" /></button></form><p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Encrypted session / TROS</p></div></section></main>
}
