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
      <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
        <div className="rounded-2xl bg-[#EAF79F] p-5 text-[#1B1E1C] mb-8 shadow-sm">
          <Sparkles className="size-10" />
        </div>
        <h2 className="text-5xl font-light tracking-tight mb-4">Your project is <span className="font-medium">building...</span></h2>
        <p className="text-gray-500 font-medium max-w-md mx-auto mb-10 text-lg">
          The AI agents have received your prompt and are currently scaffolding your application.
        </p>
        <div className="flex gap-4">
          <Link 
            href={`/website-factory/${result.projectId}`} 
            className="flex items-center gap-2 rounded-full bg-[#1B1E1C] px-8 py-4 text-sm font-bold text-white hover:bg-black transition shadow-lg"
          >
            Go to Project Studio <ArrowRight className="size-4" />
          </Link>
          <button 
            onClick={() => { setResult(null); setState('idle'); setPrompt('') }}
            className="rounded-full border border-gray-200 bg-[#F4F5F4] px-8 py-4 text-sm font-bold text-black hover:bg-white hover:shadow-sm transition"
          >
            Create Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-[#1B1E1C]">
            What do you <br/><span className="font-medium">want to build?</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">
            Prompt your entire web app, dashboard, or landing page into existence.
          </p>
        </div>

        <form onSubmit={submit} className="relative group">
          <div className="relative flex w-full flex-col rounded-[2rem] border-2 border-gray-100 bg-[#F4F5F4] shadow-sm transition-all focus-within:border-[#1B1E1C] focus-within:bg-white">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your app in detail..."
              className="min-h-[160px] w-full resize-none rounded-[2rem] bg-transparent px-8 py-6 text-lg font-medium outline-none placeholder:text-gray-400 text-black"
            />
            
            <div className="flex items-center justify-between px-6 pb-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 px-2">
                <Globe className="size-4" />
                <span>Full-stack</span>
                <Code2 className="size-4 ml-4" />
                <span>Next.js App Router</span>
              </div>
              
              <button
                type="submit"
                disabled={state === 'loading' || prompt.length < 5}
                className="flex size-14 items-center justify-center rounded-full bg-[#1B1E1C] text-white transition-all hover:bg-black disabled:opacity-50 hover:shadow-lg"
              >
                {state === 'loading' ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <ArrowUpRight className="size-6" />
                )}
              </button>
            </div>
          </div>
          {error && <p className="mt-4 text-sm font-semibold text-red-500 text-center">{error}</p>}
        </form>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {suggestionPills.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => setPrompt(suggestion)}
              className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-500 transition hover:bg-[#F4F5F4] hover:text-black shadow-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
