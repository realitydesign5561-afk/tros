'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  CheckCircle2,
  Code,
  Copy,
  Download,
  ExternalLink,
  GitBranch,
  Globe,
  Globe2,
  Loader2,
  Lock,
  Maximize2,
  Monitor,
  RefreshCw,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
  X,
  Zap,
} from 'lucide-react'

interface WebsitePreviewStudioProps {
  projectId: string
  projectName: string
  blueprint: string
  status: string
  deploymentUrl?: string | null
  domain?: string | null
  repositoryUrl?: string | null
}

export function WebsitePreviewStudio({
  projectId,
  projectName,
  blueprint,
  status,
  deploymentUrl,
  domain: initialDomain,
  repositoryUrl: initialRepoUrl,
}: WebsitePreviewStudioProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  // Current domain & repository state
  const [activeDomain, setActiveDomain] = useState<string | null>(initialDomain || null)
  const [activeRepoUrl, setActiveRepoUrl] = useState<string | null>(initialRepoUrl || null)

  // Modals state
  const [showExportModal, setShowExportModal] = useState(false)
  const [showDomainModal, setShowDomainModal] = useState(false)

  // Export to GitHub state
  const [repoName, setRepoName] = useState(projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))
  const [isPrivate, setIsPrivate] = useState(false)
  const [githubToken, setGithubToken] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  // Custom Domain state
  const [domainInput, setDomainInput] = useState(activeDomain || '')
  const [bindingDomain, setBindingDomain] = useState(false)
  const [domainSuccess, setDomainSuccess] = useState<string | null>(null)
  const [domainError, setDomainError] = useState<string | null>(null)
  const [dnsRecords, setDnsRecords] = useState<any[]>([])

  const previewUrl = `/preview/site/${projectId}`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(blueprint)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyPreviewLink = () => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}${previewUrl}`
      navigator.clipboard.writeText(fullUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([blueprint], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-index.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Handle Export to GitHub
  const handleExportToGitHub = async (e: React.FormEvent) => {
    e.preventDefault()
    setExporting(true)
    setExportError(null)
    setExportSuccess(null)

    try {
      const res = await fetch('/api/website-factory/export-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          repoName,
          isPrivate,
          githubToken: githubToken || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setActiveRepoUrl(data.repoUrl)
        setExportSuccess(data.message || `Exported to ${data.repoUrl}`)
      } else {
        setExportError(data.error || 'Failed to export to GitHub.')
      }
    } catch (err: any) {
      setExportError(err.message || 'Network error during export.')
    } finally {
      setExporting(false)
    }
  }

  // Handle Attach Custom Domain
  const handleAttachDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domainInput.trim()) return

    setBindingDomain(true)
    setDomainError(null)
    setDomainSuccess(null)

    try {
      const res = await fetch('/api/website-factory/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          domain: domainInput.trim(),
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setActiveDomain(data.domain)
        setDnsRecords(data.dnsRecords || [])
        setDomainSuccess(`Domain ${data.domain} attached with active Edge SSL.`)
      } else {
        setDomainError(data.error || 'Failed to attach domain.')
      }
    } catch (err: any) {
      setDomainError(err.message || 'Network error attaching domain.')
    } finally {
      setBindingDomain(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 1. Prominent Publishable Preview Link Card */}
      <div className="rounded-3xl border border-[#eaf79f]/30 bg-gradient-to-r from-[#171a18] via-[#141615] to-[#121513] p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#eaf79f]">
              Publishable Preview Link Ready
            </span>
            <span className="text-xs text-white/40">· Zero-Login Edge Access</span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Globe className="size-4 text-[#eaf79f]" />
            {activeDomain ? `https://${activeDomain}` : previewUrl}
          </h4>
          <p className="text-xs text-white/60">
            Share this live link with clients, team members, or test on any smartphone or browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleCopyPreviewLink}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            {copiedLink ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            {copiedLink ? 'Link Copied!' : 'Copy Preview Link'}
          </button>

          <Link
            href={previewUrl}
            target="_blank"
            className="px-5 py-2.5 rounded-xl bg-[#eaf79f] hover:bg-white text-black text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#eaf79f]/10"
          >
            <ExternalLink className="size-3.5" /> Open Live Preview
          </Link>
        </div>
      </div>

      {/* 2. Operations Action Bar (Export to GitHub & Custom Domain) */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Export to GitHub Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141615] border border-white/10 flex items-center justify-between gap-3 shadow-md">
          <div className="space-y-0.5 truncate">
            <div className="flex items-center gap-2">
              <GitBranch className="size-4 text-purple-400 shrink-0" />
              <span className="font-bold text-sm text-white truncate">GitHub Repository</span>
            </div>
            <p className="text-xs text-white/50 truncate">
              {activeRepoUrl ? (
                <a
                  href={activeRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-300 hover:underline"
                >
                  {activeRepoUrl.replace('https://github.com/', '')}
                </a>
              ) : (
                'Export scaffold to GitHub'
              )}
            </p>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white text-xs font-bold transition shrink-0"
          >
            {activeRepoUrl ? 'Manage Repo' : 'Export to GitHub'}
          </button>
        </div>

        {/* Custom Domain Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141615] border border-white/10 flex items-center justify-between gap-3 shadow-md">
          <div className="space-y-0.5 truncate">
            <div className="flex items-center gap-2">
              <Globe2 className="size-4 text-[#eaf79f] shrink-0" />
              <span className="font-bold text-sm text-white truncate">Custom Domain</span>
              {activeDomain && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  SSL Active
                </span>
              )}
            </div>
            <p className="text-xs text-white/50 truncate">
              {activeDomain ? activeDomain : 'Attach branded apex or subdomain'}
            </p>
          </div>

          <button
            onClick={() => setShowDomainModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition shrink-0"
          >
            {activeDomain ? 'DNS Settings' : 'Add Domain'}
          </button>
        </div>
      </div>

      {/* 3. Main Interactive Sandbox Viewer */}
      <div className="rounded-3xl border border-white/10 bg-[#141615] overflow-hidden shadow-2xl space-y-0">
        {/* Top Studio Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-[#181a19]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#eaf79f] text-black flex items-center justify-center font-bold">
              <Globe2 className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                {projectName}
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Preview Sandbox
                </span>
              </h3>
              <p className="text-[11px] text-white/50">Full-Stack HTML & Tailwind Scaffold</p>
            </div>
          </div>

          {/* Viewport & View Mode Toggles */}
          <div className="flex items-center gap-2">
            {activeTab === 'preview' && (
              <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/10 text-xs">
                <button
                  onClick={() => setDevice('desktop')}
                  className={`p-1.5 rounded-lg transition ${
                    device === 'desktop' ? 'bg-[#eaf79f] text-black font-bold' : 'text-white/60 hover:text-white'
                  }`}
                  title="Desktop View (100%)"
                >
                  <Monitor className="size-4" />
                </button>
                <button
                  onClick={() => setDevice('tablet')}
                  className={`p-1.5 rounded-lg transition ${
                    device === 'tablet' ? 'bg-[#eaf79f] text-black font-bold' : 'text-white/60 hover:text-white'
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="size-4" />
                </button>
                <button
                  onClick={() => setDevice('mobile')}
                  className={`p-1.5 rounded-lg transition ${
                    device === 'mobile' ? 'bg-[#eaf79f] text-black font-bold' : 'text-white/60 hover:text-white'
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="size-4" />
                </button>
                <button
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="p-1.5 text-white/60 hover:text-white transition"
                  title="Refresh Preview Iframe"
                >
                  <RefreshCw className="size-3.5" />
                </button>
              </div>
            )}

            {/* Tab Switcher: Preview vs Code */}
            <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/10 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'preview' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                Interactive Preview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'code' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                <Code className="size-3.5" /> Source Code
              </button>
            </div>

            <Link
              href={previewUrl}
              target="_blank"
              className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition"
              title="Open Shareable Preview Page"
            >
              <ExternalLink className="size-4" />
            </Link>
          </div>
        </div>

        {/* Main Studio Area */}
        {activeTab === 'preview' ? (
          <div className="p-4 sm:p-6 bg-[#0a0c0b] flex items-center justify-center min-h-[580px] overflow-hidden">
            <div
              className="transition-all duration-300 ease-out flex items-center justify-center bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20"
              style={{
                width: device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '375px',
                height: '620px',
              }}
            >
              <iframe
                key={iframeKey}
                src={`/api/website-factory/preview/${projectId}`}
                title="Interactive Website Preview"
                className="w-full h-full border-0 select-text"
                sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
              />
            </div>
          </div>
        ) : (
          <div className="p-5 bg-[#0a0c0b] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-white/50">Generated HTML5 & Tailwind Source Blueprint</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  {copiedCode ? <CheckCircle2 className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  {copiedCode ? 'Copied!' : 'Copy Code'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 rounded-lg bg-[#eaf79f] hover:bg-white text-black text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="size-3" />
                  Download HTML
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-2xl bg-black/80 border border-white/10 text-white/80 font-mono text-xs max-h-[520px] overflow-auto whitespace-pre-wrap leading-relaxed select-all">
              {blueprint}
            </pre>
          </div>
        )}
      </div>

      {/* Export to GitHub Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141615] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-purple-500/30 text-white shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowExportModal(false)}
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
                  Continuous Versioning
                </span>
                <h3 className="text-xl font-bold text-white">Export to GitHub</h3>
              </div>
            </div>

            <form onSubmit={handleExportToGitHub} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Repository Name:
                </label>
                <input
                  type="text"
                  required
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="e.g. agency-web-project"
                  className="w-full bg-[#0a0c0b] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded border-white/20 bg-black text-purple-600"
                />
                <label htmlFor="isPrivate" className="text-white/80 cursor-pointer">
                  Private Repository (Default: Public)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  GitHub Personal Access Token (Optional):
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Optional for live push)"
                  className="w-full bg-[#0a0c0b] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-400 font-mono text-[11px]"
                />
                <p className="text-[10px] text-white/40 mt-1">
                  Leave blank to map to default agency worktree or provide token with `repo` scope to automatically create remote.
                </p>
              </div>

              {exportSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
                  <p className="font-bold flex items-center gap-1.5">
                    <Check className="size-4" /> {exportSuccess}
                  </p>
                  {activeRepoUrl && (
                    <a
                      href={activeRepoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs underline font-semibold text-emerald-200"
                    >
                      Open Repository on GitHub <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              )}

              {exportError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                  {exportError}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={exporting || !repoName.trim()}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Pushing to GitHub...
                    </>
                  ) : (
                    <>
                      <GitBranch className="size-4" /> Export Repository
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Domain Modal */}
      {showDomainModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141615] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-white/15 text-white shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowDomainModal(false)}
              className="absolute top-5 right-5 text-white/40 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-[#eaf79f]/20 text-[#eaf79f] flex items-center justify-center font-bold">
                <Globe className="size-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#eaf79f]">
                  Domain Routing & DNS
                </span>
                <h3 className="text-xl font-bold text-white">Attach Custom Domain</h3>
              </div>
            </div>

            <form onSubmit={handleAttachDomain} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Custom Domain or Subdomain:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="e.g. myagency.com or site.brand.ng"
                    className="flex-1 bg-[#0a0c0b] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#eaf79f] font-mono"
                  />
                  <button
                    type="submit"
                    disabled={bindingDomain || !domainInput.trim()}
                    className="px-5 py-3 rounded-xl bg-[#eaf79f] text-black font-bold text-xs hover:bg-white transition disabled:opacity-40"
                  >
                    {bindingDomain ? <Loader2 className="size-4 animate-spin" /> : 'Verify & Bind'}
                  </button>
                </div>
              </div>

              {domainSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Check className="size-4" /> {domainSuccess}
                  </p>
                  <p className="text-[11px] text-white/70">
                    Auto-renewing Let&apos;s Encrypt wildcard SSL certificate provisioned.
                  </p>
                </div>
              )}

              {domainError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                  {domainError}
                </div>
              )}

              {/* Required DNS Records Table */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
                  Required DNS Configuration:
                </span>
                <div className="rounded-2xl border border-white/10 bg-black/50 overflow-hidden font-mono text-[11px]">
                  <div className="grid grid-cols-4 p-2.5 bg-white/5 border-b border-white/10 text-white/40 font-bold uppercase text-[10px]">
                    <span>Type</span>
                    <span>Host / Name</span>
                    <span>Value / Target</span>
                    <span>Status</span>
                  </div>
                  <div className="grid grid-cols-4 p-2.5 border-b border-white/5 text-white/90 items-center">
                    <span className="text-[#eaf79f] font-bold">A</span>
                    <span>@</span>
                    <span>76.76.21.21</span>
                    <span className="text-emerald-400 font-bold">✓ Active</span>
                  </div>
                  <div className="grid grid-cols-4 p-2.5 text-white/90 items-center">
                    <span className="text-[#eaf79f] font-bold">CNAME</span>
                    <span>www</span>
                    <span>cname.tros-edge.net</span>
                    <span className="text-emerald-400 font-bold">✓ Active</span>
                  </div>
                </div>
                <p className="text-[10px] text-white/40">
                  Configure these records with your DNS registrar (Namecheap, GoDaddy, Cloudflare). Changes typically propagate in 1-5 minutes.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowDomainModal(false)}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
                >
                  Done
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
