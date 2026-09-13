'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Bot, Loader2 } from 'lucide-react'

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
  return <main className="flex min-h-screen items-center justify-center bg-background px-6 py-8"><div className="w-full max-w-sm"><div className="mb-8 text-center"><div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Bot className="size-6" /></div><h1 className="mt-5 text-2xl font-semibold tracking-tight">Welcome to TROS</h1><p className="mt-2 text-sm text-muted-foreground">Sign in to your operations center.</p></div><form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-6"><label className="block space-y-2 text-sm"><span className="font-medium">Email</span><input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label><label className="block space-y-2 text-sm"><span className="font-medium">Password</span><input value={password} onChange={e => setPassword(e.target.value)} type="password" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>{error && <p className="text-sm text-destructive">{error}</p>}<button disabled={loading} className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground disabled:opacity-60">{loading && <Loader2 className="size-4 animate-spin" />}Sign in</button></form></div></main>
}
