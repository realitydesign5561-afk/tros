'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  ExternalLink,
  GitBranch,
  Globe,
  Globe2,
  Layers,
  Loader2,
  Plus,
  Share2,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description?: string
  status: string
  source?: string
  repositoryUrl?: string
  domain?: string
  deploymentUrl?: string
  createdAt: string
}

export function WebsiteFactory() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<{ projectId: string; buildId: string; status: string } | null>(null)
  const [error, setError] = useState('')

  // Projects list
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // GitHub Import modal state
  const [showImportModal, setShowImportModal] = useState(false)
  const [importRepoUrl, setImportRepoUrl] = useState('')
  const [importBranch, setImportBranch] = useState('main')
  const [importCustomName, setImportCustomName] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/website-factory/projects')
      .then((res) => (res.ok ? res.json() : { projects: [] }))
      .then((data) => setProjects(data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoadingProjects(false))
  }, [])

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

  // Handle GitHub Import
  async function handleImportGitHub(e: React.FormEvent) {
    e.preventDefault()
    if (!importRepoUrl.trim()) return

    setImporting(true)
    setImportError(null)

    try {
      const res = await fetch('/api/website-factory/import-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: importRepoUrl.trim(),
          branch: importBranch.trim() || 'main',
          customName: importCustomName.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success && data.project) {
        setShowImportModal(false)
        router.push(`/website-factory/${data.project.id}`)
      } else {
        setImportError(data.error || 'Failed to import repository.')
      }
    } catch (err: any) {
      setImportError(err.message || 'Network error during GitHub import.')
    } finally {
      setImporting(false)
    }
  }

  const handleCopyLink = (projectId: string) => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}/preview/site/${projectId}`
      navigator.clipboard.writeText(fullUrl)
      setCopiedId(projectId)
      setTimeout(() => setCopiedId(null), 2000)
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
    'A modern high-conversion fitness coaching landing page with client transformations and checkout',
  ]

  if (result) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-4">
        <div className="rounded-2xl bg-[#eaf79f] p-5 text-black mb-6 shadow-2xl animate-bounce">
          <Sparkles className="size-10" />
        </div>
        <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-white mb-3">
          Your project is <span className="font-bold text-[#eaf79f]">ready!</span>
        </h2>
        <p className="text-white/60 font-medium max-w-md mx-auto mb-8 text-sm sm:text-base">
          The AI Coding Agent has synthesized your specification, generated responsive HTML/Tailwind components, and assembled your publishable preview link.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href={`/website-factory/${result.projectId}`}
            className="flex items-center gap-2 rounded-2xl bg-[#eaf79f] px-8 py-3.5 text-sm font-bold text-black hover:bg-white transition shadow-lg"
          >
            Open Project Studio & Preview <ArrowRight className="size-4" />
          </Link>
          <Link
            href={`/preview/site/${result.projectId}`}
            target="_blank"
            className="flex items-center gap-2 rounded-2xl bg-white/10 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition border border-white/10"
          >
            <ExternalLink className="size-4" /> Open Publishable Preview Link
          </Link>
          <button
            onClick={() => {
              setResult(null)
              setState('idle')
              setPrompt('')
            }}
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition"
          >
            Scaffold Another App
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eaf79f]/10 border border-[#eaf79f]/20 text-[#eaf79f] text-xs font-bold uppercase tracking-widest">
          <Sparkles className="size-3.5" /> Full-Stack AI Website Factory
        </div>

        <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-white leading-tight">
          What do you <br />
          <span className="font-semibold text-[#eaf79f]">want to build?</span>
        </h1>

        <p className="text-white/60 font-medium text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Prompt full-stack websites, import existing web projects from GitHub, attach custom branded domains, and share instant publishable preview links with clients.
        </p>

        {/* Action Buttons: Scaffold Prompt vs GitHub Import */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-600/20 active:scale-95"
          >
            <GitBranch className="size-4" /> Import from GitHub
          </button>
        </div>
      </div>

      {/* Main Prompt Box */}
      <form onSubmit={submit} className="relative group max-w-4xl mx-auto">
        <div className="relative flex w-full flex-col rounded-[2rem] border border-white/10 bg-[#141615] shadow-2xl transition-all focus-within:border-[#eaf79f] focus-within:bg-[#181a19]">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Build a premium website for a Lagos real estate company with property listings, property detail pages, lead forms, responsive layouts, and modern typography..."
            className="min-h-[160px] w-full resize-none rounded-[2rem] bg-transparent px-8 py-6 text-base sm:text-lg font-medium outline-none placeholder:text-white/30 text-white leading-relaxed"
          />

          <div className="flex items-center justify-between px-6 pb-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/50 px-2">
              <Globe className="size-4 text-[#eaf79f]" />
              <span>Edge Preview Link Included</span>
              <Code2 className="size-4 ml-4 text-[#eaf79f]" />
              <span>Tailwind + HTML5 Scaffold</span>
            </div>

            <button
              type="submit"
              disabled={state === 'loading' || prompt.length < 5}
              className="flex size-14 items-center justify-center rounded-full bg-[#eaf79f] text-black transition-all hover:bg-white disabled:opacity-40 hover:shadow-xl font-bold active:scale-95"
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

      {/* Suggestion Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
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

      {/* Recent Websites & Publishable Links Gallery */}
      <div className="pt-8 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-[#eaf79f]" />
            <h2 className="text-lg font-bold text-white">Your Web Projects & Publishable Links</h2>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/70">
              {projects.length}
            </span>
          </div>
          <span className="text-xs text-white/40">Ready to Share & Deploy</span>
        </div>

        {loadingProjects ? (
          <div className="p-8 text-center text-white/40 text-xs flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-[#eaf79f]" /> Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-white/50 text-xs">
            No projects created yet. Prompt an app above or click &quot;Import from GitHub&quot; to begin.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => {
              const previewLink = `/preview/site/${p.id}`
              const isCopied = copiedId === p.id

              return (
                <div
                  key={p.id}
                  className="rounded-3xl border border-white/10 bg-[#141615] p-5 flex flex-col justify-between space-y-4 hover:border-[#eaf79f]/40 transition shadow-xl group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="size-10 rounded-xl bg-[#eaf79f]/10 text-[#eaf79f] flex items-center justify-center font-bold">
                        <Globe2 className="size-5" />
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 justify-end">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {p.status}
                        </span>
                        {p.domain && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                            {p.domain}
                          </span>
                        )}
                        {p.source === 'GITHUB_IMPORT' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                            GitHub
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-[#eaf79f] transition truncate">
                        {p.name}
                      </h3>
                      <p className="text-xs text-white/50 line-clamp-2 mt-1 leading-relaxed">
                        {p.description || 'AI Generated web application'}
                      </p>
                    </div>

                    {/* Publishable Preview Link Quick Copy */}
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] text-[#eaf79f] truncate max-w-[170px]">
                        {previewLink}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(p.id)}
                        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold transition flex items-center gap-1"
                        title="Copy publishable preview link"
                      >
                        {isCopied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                        {isCopied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Actions Hub */}
                  <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-center text-xs font-bold">
                    <Link
                      href={`/website-factory/${p.id}`}
                      className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition flex items-center justify-center gap-1"
                    >
                      Studio Editor
                    </Link>

                    <Link
                      href={previewLink}
                      target="_blank"
                      className="py-2.5 rounded-xl bg-[#eaf79f] text-black hover:bg-white transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      <ExternalLink className="size-3.5" /> Preview Link
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* GitHub Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141615] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-purple-500/30 text-white shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-5 right-5 text-white/40 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-purple-600/20 text-purple-300 flex items-center justify-center font-bold">
                <GitBranch className="size-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  GitHub Integration
                </span>
                <h3 className="text-xl font-bold text-white">Import Web Project</h3>
              </div>
            </div>

            <form onSubmit={handleImportGitHub} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  GitHub Repository URL:
                </label>
                <input
                  type="text"
                  required
                  value={importRepoUrl}
                  onChange={(e) => setImportRepoUrl(e.target.value)}
                  placeholder="e.g. https://github.com/owner/repository"
                  className="w-full bg-[#0a0c0b] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Branch:
                  </label>
                  <input
                    type="text"
                    value={importBranch}
                    onChange={(e) => setImportBranch(e.target.value)}
                    placeholder="main"
                    className="w-full bg-[#0a0c0b] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Project Name (Optional):
                  </label>
                  <input
                    type="text"
                    value={importCustomName}
                    onChange={(e) => setImportCustomName(e.target.value)}
                    placeholder="Custom App Name"
                    className="w-full bg-[#0a0c0b] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <p className="text-[11px] text-white/50 leading-relaxed">
                TROS will parse the repository, extract the web markup and responsive assets, and create an edge-ready live preview with custom domain support.
              </p>

              {importError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                  {importError}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={importing || !importRepoUrl.trim()}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  {importing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Synchronizing Repository...
                    </>
                  ) : (
                    <>
                      <GitBranch className="size-4" /> Import and Launch Preview
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
