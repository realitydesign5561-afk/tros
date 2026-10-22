'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowRight, Loader2, Sparkles, Code2, Globe } from 'lucide-react'

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

    setState('loading')
    setError('')
    try {
      const response = await fetch('/api/website-factory/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, projectName: 'AI Generated App' }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Generation failed.')
        setState('error')
        return
      }

      setResult(data)
      setState('done')
    } catch (err: any) {
      setError(err.message || 'Network request failed.')
      setState('error')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const suggestionPills = [
    'A real estate company in Lagos with property listings, filter by price, and WhatsApp inquiry buttons',
    'A luxury creative studio portfolio with dark mode, interactive service grid, and booking forms',
    'A B2B SaaS marketing website with feature matrix, tier comparison table, and FAQ accordion',
    'A modern high-conversion fitness & wellness coaching landing page with client transformations',
  ]

  if (result) {
    return (
      <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center text-center p-4">
        <div className="rounded-2xl bg-[#eaf79f] p-5 text-black mb-6 shadow-2xl animate-bounce">
          <Sparkles className="size-10" />
        </div>
        <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-white mb-3">
          Your project is <span className="font-bold text-[#eaf79f]">building...</span>
        </h2>
        <p className="text-white/60 font-medium max-w-md mx-auto mb-8 text-sm sm:text-base">
          The AI Coding Agent has synthesized your specification, generated responsive HTML/Tailwind components, and assembled your preview sandbox.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href={`/website-factory/${result.projectId}`}
            className="flex items-center gap-2 rounded-full bg-[#eaf79f] px-8 py-3.5 text-sm font-bold text-black hover:bg-white transition shadow-lg"
          >
            Open Project Studio & Preview <ArrowRight className="size-4" />
          </Link>
          <button
            onClick={() => {
              setResult(null)
              setState('idle')
              setPrompt('')
            }}
            className="rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition"
          >
            Scaffold Another App
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eaf79f]/10 border border-[#eaf79f]/20 text-[#eaf79f] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="size-3.5" /> Full-Stack AI Website Factory
          </div>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-white">
            What do you <br />
            <span className="font-medium text-[#eaf79f]">want to build?</span>
          </h1>
          <p className="text-white/60 font-medium text-base max-w-2xl mx-auto">
            Prompt full-stack websites, high-converting agency landing pages, or client web applications into existence with instant live previews.
          </p>
        </div>

        <form onSubmit={submit} className="relative group">
          <div className="relative flex w-full flex-col rounded-[2rem] border border-white/10 bg-[#141615] shadow-2xl transition-all focus-within:border-[#eaf79f] focus-within:bg-[#181a19]">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Build a premium website for a Lagos real estate company with property listings, property detail pages, lead forms, responsive layouts, and modern typography..."
              className="min-h-[160px] w-full resize-none rounded-[2rem] bg-transparent px-8 py-6 text-base sm:text-lg font-medium outline-none placeholder:text-white/30 text-white"
            />

            <div className="flex items-center justify-between px-6 pb-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/50 px-2">
                <Globe className="size-4 text-[#eaf79f]" />
                <span>Responsive Web App</span>
                <Code2 className="size-4 ml-4 text-[#eaf79f]" />
                <span>Tailwind + HTML5 Scaffold</span>
              </div>

              <button
                type="submit"
                disabled={state === 'loading' || prompt.length < 5}
                className="flex size-14 items-center justify-center rounded-full bg-[#eaf79f] text-black transition-all hover:bg-white disabled:opacity-40 hover:shadow-xl font-bold"
              >
                {state === 'loading' ? (
                  <Loader2 className="size-6 animate-spin text-black" />
                ) : (
                  <ArrowUpRight className="size-6 text-black" />
                )}
              </button>
            </div>
          </div>
          {error && <p className="mt-4 text-xs font-semibold text-red-400 text-center">{error}</p>}
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {suggestionPills.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => setPrompt(suggestion)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white hover:border-white/20 shadow-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
