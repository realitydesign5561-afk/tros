'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Globe,
  Maximize2,
  Monitor,
  RefreshCw,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
} from 'lucide-react'

export default function PublishableSitePreviewPage() {
  const params = useParams()
  const projectId = params?.id as string

  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [copied, setCopied] = useState(false)
  const [toolbarVisible, setToolbarVisible] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/website-factory/preview-info?projectId=${projectId}`)
        if (res.ok) {
          const data = await res.json()
          setProject(data)
        }
      } catch (err) {
        console.error('Failed to load site preview:', err)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) loadProject()
  }, [projectId])

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#070808] text-white flex flex-col antialiased select-none">
      {/* Top Floating Publishable Header */}
      {toolbarVisible && (
        <header className="h-14 bg-[#141615]/95 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between text-xs z-50 sticky top-0 gap-3">
          {/* Brand & Project Info */}
          <div className="flex items-center gap-2.5 truncate">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-white hover:text-[#eaf79f] transition"
            >
              <div className="size-6 rounded-lg bg-[#eaf79f] text-black font-black flex items-center justify-center text-[10px]">
                <Sparkles className="size-3" />
              </div>
              <span className="hidden sm:inline">TROS Preview</span>
            </Link>
            <span className="text-white/30 hidden sm:inline">/</span>
            <span className="font-bold text-white truncate max-w-44 sm:max-w-xs">
              {project?.name || 'Live Edge Website'}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              <ShieldCheck className="size-3" /> SSL Active
            </span>
          </div>

          {/* Viewport Controls */}
          <div className="flex items-center gap-1.5 bg-black/60 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-lg transition ${
                device === 'desktop' ? 'bg-[#eaf79f] text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
              title="Desktop View (100%)"
            >
              <Monitor className="size-3.5" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-lg transition ${
                device === 'tablet' ? 'bg-[#eaf79f] text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="size-3.5" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-lg transition ${
                device === 'mobile' ? 'bg-[#eaf79f] text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="size-3.5" />
            </button>
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="p-1.5 text-white/50 hover:text-white transition"
              title="Reload preview"
            >
              <RefreshCw className="size-3" />
            </button>
          </div>

          {/* Share & Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 active:scale-95"
            >
              {copied ? <Check className="size-3.5 text-emerald-400" /> : <Share2 className="size-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share Link'}</span>
            </button>

            {project?.domain && (
              <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white/80 text-[11px] font-mono">
                <Globe className="size-3 text-[#eaf79f]" /> {project.domain}
              </span>
            )}

            <a
              href={`/api/website-factory/preview/${projectId}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
              title="Open Raw Standalone HTML"
            >
              <ExternalLink className="size-3.5" />
            </a>

            <button
              onClick={() => setToolbarVisible(false)}
              className="p-1.5 rounded-xl text-white/50 hover:text-white transition"
              title="Hide toolbar for full screen view"
            >
              <ChevronUp className="size-3.5" />
            </button>
          </div>
        </header>
      )}

      {/* Floating Toolbar Show Button when Hidden */}
      {!toolbarVisible && (
        <button
          onClick={() => setToolbarVisible(true)}
          className="fixed top-3 right-3 z-50 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold hover:bg-black transition flex items-center gap-1 shadow-2xl"
        >
          <ChevronDown className="size-3" /> Show Toolbar
        </button>
      )}

      {/* Main Preview Container */}
      <div className="flex-1 flex items-center justify-center p-0 sm:p-4 bg-[#0a0c0b] overflow-auto">
        <div
          className="transition-all duration-300 ease-out flex items-center justify-center bg-white shadow-2xl border-x sm:border border-white/10 overflow-hidden w-full h-[calc(100vh-3.5rem)]"
          style={{
            maxWidth: device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '385px',
            height: toolbarVisible ? 'calc(100vh - 3.5rem)' : '100vh',
            borderRadius: device === 'desktop' ? '0' : '20px',
          }}
        >
          <iframe
            key={iframeKey}
            src={`/api/website-factory/preview/${projectId}`}
            title="Publishable Live Website Preview"
            className="w-full h-full border-0 select-text"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
          />
        </div>
      </div>
    </div>
  )
}
