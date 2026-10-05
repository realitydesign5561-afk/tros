'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowRight, Loader2, Sparkles, Send, Box, Code2, Globe } from 'lucide-react'

export function WebsiteFactory() {
  const [prompt, setPrompt] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<{ projectId: string; buildId: string; status: string } | null>(null)
  const [error, setError] = useState('')

  async function submit(event?: React.FormEvent) {
    if (event) event.preventDefault()
    if (!prompt.trim() || prompt.length < 10) {
      setError('Please provide a more detailed prompt (min 10 characters).')
      return
    }
    
    setState('loading'); setError('')
    const response = await fetch('/api/website-factory/generate', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ prompt, projectName: 'AI Generated App' }) 
    })
    
    const data = await response.json()
    if (!response.ok) { 
      setError(data.error || 'Generation failed.')
      setState('error')
      return 
    }
    
    setResult(data)
    setState('done')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const suggestionPills = [
    "A CRM dashboard with charts and tables",
    "A real estate landing page with a property search",
    "A SaaS marketing site with pricing plans",
    "A personal portfolio with a dark mode toggle"
  ]

  if (result) {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-emerald-500/10 p-4 text-emerald-500 mb-6">
          <Sparkles className="size-10" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-3">Your project is building...</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          The AI agents have received your prompt and are currently scaffolding your application.
        </p>
        <div className="flex gap-4">
          <Link 
            href={`/website-factory/${result.projectId}`} 
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            Go to Project Studio <ArrowRight className="size-4" />
          </Link>
          <button 
            onClick={() => { setResult(null); setState('idle'); setPrompt('') }}
            className="rounded-full border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-accent transition"
          >
            Create Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
            What do you want to build?
          </h1>
          <p className="text-muted-foreground text-lg">
            Prompt your entire web app, dashboard, or landing page into existence.
          </p>
        </div>

        <form onSubmit={submit} className="relative group">
          <div className="relative flex w-full flex-col rounded-3xl border border-border bg-card shadow-sm transition-all focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/10">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your app in detail..."
              className="min-h-[120px] w-full resize-none rounded-3xl bg-transparent px-6 py-5 text-base outline-none placeholder:text-muted-foreground/60"
            />
            
            <div className="flex items-center justify-between px-4 pb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground/60 px-2">
                <Globe className="size-3" />
                <span>Full-stack</span>
                <Code2 className="size-3 ml-2" />
                <span>Next.js App Router</span>
              </div>
              
              <button
                type="submit"
                disabled={state === 'loading' || prompt.length < 5}
                className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 disabled:hover:opacity-50"
              >
                {state === 'loading' ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <ArrowUpRight className="size-5" />
                )}
              </button>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-destructive text-center">{error}</p>}
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {suggestionPills.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => setPrompt(suggestion)}
              className="rounded-full border border-border/50 bg-card/50 px-4 py-2 text-xs text-muted-foreground transition hover:bg-card hover:text-foreground hover:border-border"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
