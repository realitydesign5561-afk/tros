'use client'

import { useState } from 'react'
import {
  Code,
  Copy,
  CheckCircle2,
  Download,
  ExternalLink,
  Globe2,
  Maximize2,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
  Sparkles,
} from 'lucide-react'

interface WebsitePreviewStudioProps {
  projectId: string
  projectName: string
  blueprint: string
  status: string
  deploymentUrl?: string | null
}

export function WebsitePreviewStudio({
  projectId,
  projectName,
  blueprint,
  status,
  deploymentUrl,
}: WebsitePreviewStudioProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [copied, setCopied] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  const handleCopy = () => {
    navigator.clipboard.writeText(blueprint)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  return (
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
                Live Preview Ready
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

          <a
            href={`/api/website-factory/preview/${projectId}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition"
            title="Open Live Preview in New Window"
          >
            <ExternalLink className="size-4" />
          </a>
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
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-forms allow-same-origin"
            />
          </div>
        </div>
      ) : (
        <div className="p-5 bg-[#0a0c0b] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white/50">Generated HTML5 & Tailwind Source Blueprint</span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                {copied ? <CheckCircle2 className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                {copied ? 'Copied!' : 'Copy Code'}
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
  )
}
