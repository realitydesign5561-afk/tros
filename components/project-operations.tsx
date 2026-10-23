'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  Check,
  Cloud,
  ExternalLink,
  GitBranch,
  Globe2,
  Loader2,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
} from 'lucide-react'

export function ProjectOperations({ projectId }: { projectId: string }) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  async function run(action: 'import' | 'deploy' | 'domain' | 'management' | 'export') {
    setBusy(action)
    setMessage('')

    try {
      if (action === 'export') {
        const response = await fetch('/api/website-factory/export-github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, repoName: value || undefined }),
        })
        const data = await response.json()
        setMessage(data.message || data.error || 'Export operation completed.')
        if (response.ok) setValue('')
      } else if (action === 'domain') {
        const response = await fetch('/api/website-factory/domain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, domain: value }),
        })
        const data = await response.json()
        setMessage(data.message || data.error || 'Domain attached.')
        if (response.ok) setValue('')
      } else if (action === 'import') {
        const response = await fetch('/api/website-factory/import-github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoUrl: value }),
        })
        const data = await response.json()
        setMessage(data.message || data.error || 'Repository synchronized.')
        if (response.ok) setValue('')
      } else {
        const response = await fetch('/api/website-factory/project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, action, value: value || undefined }),
        })
        const data = await response.json()
        setMessage(data.message || data.error || 'Operation complete.')
        if (response.ok && action !== 'management') setValue('')
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Operation failed'}`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-[#141615] p-6 space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#eaf79f]">
            DevOps & Operations
          </span>
          <h3 className="mt-1 text-lg font-bold text-white">Edge Deployment, Git & Domain Control</h3>
          <p className="mt-1 text-xs text-white/50">
            Publish preview links, synchronize with GitHub repositories, and manage custom apex and subdomain records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/preview/site/${projectId}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#eaf79f] text-black px-3.5 py-1.5 text-xs font-bold hover:bg-white transition"
          >
            <Share2 className="size-3.5" /> Publishable Preview Link
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Export to GitHub */}
        <button
          onClick={() => run('export')}
          disabled={busy !== null}
          className="flex flex-col justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/40 hover:bg-white/[0.04] transition text-left space-y-3 group disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <div className="size-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
              <GitBranch className="size-4" />
            </div>
            {busy === 'export' && <Loader2 className="size-4 animate-spin text-purple-400" />}
          </div>
          <div>
            <span className="block text-xs font-bold text-white group-hover:text-purple-300 transition">
              Export to GitHub
            </span>
            <span className="block text-[11px] text-white/50 mt-0.5">
              Sync scaffold into a GitHub repository
            </span>
          </div>
        </button>

        {/* Import from GitHub */}
        <button
          onClick={() => run('import')}
          disabled={busy !== null || !value}
          className="flex flex-col justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#eaf79f]/40 hover:bg-white/[0.04] transition text-left space-y-3 group disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <div className="size-8 rounded-xl bg-[#eaf79f]/20 text-[#eaf79f] flex items-center justify-center font-bold">
              <RefreshCw className="size-4" />
            </div>
            {busy === 'import' && <Loader2 className="size-4 animate-spin text-[#eaf79f]" />}
          </div>
          <div>
            <span className="block text-xs font-bold text-white group-hover:text-[#eaf79f] transition">
              Sync from GitHub
            </span>
            <span className="block text-[11px] text-white/50 mt-0.5">
              Re-import from repository URL in box below
            </span>
          </div>
        </button>

        {/* Attach Custom Domain */}
        <button
          onClick={() => run('domain')}
          disabled={busy !== null || !value}
          className="flex flex-col justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/40 hover:bg-white/[0.04] transition text-left space-y-3 group disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <div className="size-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Globe2 className="size-4" />
            </div>
            {busy === 'domain' && <Loader2 className="size-4 animate-spin text-emerald-400" />}
          </div>
          <div>
            <span className="block text-xs font-bold text-white group-hover:text-emerald-400 transition">
              Bind Custom Domain
            </span>
            <span className="block text-[11px] text-white/50 mt-0.5">
              Attach domain in box with SSL verification
            </span>
          </div>
        </button>

        {/* Edge Deploy */}
        <button
          onClick={() => run('deploy')}
          disabled={busy !== null}
          className="flex flex-col justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/40 hover:bg-white/[0.04] transition text-left space-y-3 group disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <div className="size-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
              <Cloud className="size-4" />
            </div>
            {busy === 'deploy' && <Loader2 className="size-4 animate-spin text-blue-400" />}
          </div>
          <div>
            <span className="block text-xs font-bold text-white group-hover:text-blue-300 transition">
              Trigger Edge Build
            </span>
            <span className="block text-[11px] text-white/50 mt-0.5">
              Deploy to global CDN edge instances
            </span>
          </div>
        </button>
      </div>

      {/* Input Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Enter custom domain (e.g. myagency.com), repo URL (https://github.com/...), or note..."
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0a0c0b] px-4 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-[#eaf79f] font-mono"
        />
        <button
          onClick={() => {
            setValue('')
            setMessage('Refreshed project status.')
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition"
        >
          <RefreshCw className="size-3.5" /> Clear
        </button>
      </div>

      {message && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/90 flex items-center gap-2">
          <Check className="size-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </section>
  )
}
