'use client'

import { useEffect, useState } from 'react'
import {
  Check,
  Clapperboard,
  FileText,
  Image as ImageIcon,
  Mic2,
  Play,
  Search,
  Upload,
  WandSparkles,
  Video as VideoIcon,
  Download,
  Loader2,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  Radio,
  CheckCircle2,
  Flame,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  ShieldCheck,
} from 'lucide-react'
import { ChristianContentIdea } from '@/app/api/youtube/christian-trends/route'
import { ChannelAutomationState } from '@/app/api/youtube/automation/route'

type Asset = { id: string; type: string; status: string; url?: string; provider?: string | null }

type Video = {
  id: string
  title: string
  topic: string
  stage: string
  status: string
  format?: 'LONG' | 'SHORT'
  research?: string | null
  script?: string | null
  videoUrl?: string | null
  thumbnailUrl?: string | null
  thumbnailVariantB?: string | null
  audioUrl?: string | null
  aspectRatio?: '16:9' | '9:16'
  tags?: string | null
  description?: string | null
  scheduledAt?: string | null
  assets?: Asset[]
}

const pipelineStages = [
  { key: 'RESEARCH', label: '1. Research', icon: Search },
  { key: 'SCRIPT', label: '2. Script', icon: FileText },
  { key: 'VOICEOVER', label: '3. Voiceover', icon: Mic2 },
  { key: 'VIDEO', label: '4. Video', icon: VideoIcon },
  { key: 'THUMBNAIL', label: '5. Thumbnail', icon: ImageIcon },
  { key: 'UPLOAD', label: '6. Auto-Post', icon: Upload },
]

export function YouTubeOS() {
  const [videos, setVideos] = useState<Video[]>([])
  const [selected, setSelected] = useState<Video | null>(null)
  const [notice, setNotice] = useState('')
  const [busyAction, setBusyAction] = useState<string | null>(null)

  // Christian Content Trends State
  const [christianPrompt, setChristianPrompt] = useState('best selling Christian content for monetization')
  const [trends, setTrends] = useState<ChristianContentIdea[]>([])
  const [loadingTrends, setLoadingTrends] = useState(false)
  const [activeTab, setActiveTab] = useState<'trends' | 'pipeline' | 'thumbnails'>('trends')

  // Channel & Daily Auto-Pilot State
  const [channel, setChannel] = useState<ChannelAutomationState>({
    autoPublishDaily: true,
    approvalMode: 'AUTONOMOUS_DAILY',
    dailyPostTime: '09:00 AM EST',
    subscribers: 420,
    watchHours: 1840,
    shortsViews: 245000,
    monetizationGoal: {
      subsNeeded: 1000,
      watchHoursNeeded: 4000,
      shortsViewsNeeded: 10000000,
    },
    estimatedDailyRevenue: 24.8,
    rpm: 14.2,
    algorithmHealthScore: 96,
    lastDailyPostAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    nextScheduledPostAt: new Date(Date.now() + 3600000 * 10).toISOString(),
  })

  // Robust blob downloader (never fails on 2MB data: URLs)
  const downloadMedia = (dataUrl: string | null | undefined, filename: string) => {
    if (!dataUrl) return
    try {
      if (dataUrl.startsWith('data:')) {
        const parts = dataUrl.split(',')
        const mimeMatch = parts[0].match(/:(.*?);/)
        const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
        const binary = atob(parts[1])
        const array = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i)
        }
        const blob = new Blob([array], { type: mime })
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
      } else {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } catch (e) {
      console.error('Download error:', e)
    }
  }

  useEffect(() => {
    loadVideos()
    fetchChristianTrends('best selling Christian content for monetization')
    fetchAutomationState()
  }, [])

  async function loadVideos() {
    try {
      const res = await fetch('/api/youtube')
      if (res.ok) {
        const data = await res.json()
        setVideos(data)
        if (data.length > 0 && !selected) {
          setSelected(data[0])
        }
      }
    } catch {
      // ignore
    }
  }

  async function fetchAutomationState() {
    try {
      const res = await fetch('/api/youtube/automation')
      if (res.ok) {
        const data = await res.json()
        if (data.channelState) setChannel(data.channelState)
      }
    } catch {
      // ignore
    }
  }

  async function fetchChristianTrends(query = christianPrompt) {
    setLoadingTrends(true)
    try {
      const res = await fetch('/api/youtube/christian-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      if (data.ideas) {
        setTrends(data.ideas)
      }
    } catch (err: any) {
      console.warn('Trends load failed:', err.message)
    } finally {
      setLoadingTrends(false)
    }
  }

  // 1-Click Approve & Run Full Automation Pipeline
  async function approveAndRunPipeline(idea: ChristianContentIdea) {
    setBusyAction(idea.id)
    setNotice(`Executing autonomous pipeline for "${idea.title}" (Script -> Voiceover -> Omni Video -> Nano Thumbnail -> Schedule)...`)
    try {
      const res = await fetch('/api/youtube/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_and_run',
          title: idea.title,
          topic: idea.topic,
          format: idea.format,
          subNiche: idea.subNiche,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Pipeline execution failed')

      if (data.video) {
        setVideos((prev) => [data.video, ...prev])
        setSelected(data.video)
      }
      if (data.channelState) {
        setChannel(data.channelState)
      }

      setNotice(`"${idea.title}" scheduled for daily auto-post!`)
      setActiveTab('pipeline')
    } catch (err: any) {
      setNotice(`Automation error: ${err.message}`)
    } finally {
      setBusyAction(null)
    }
  }

  // Toggle Auto-Pilot Daily Run
  async function toggleAutoPilot() {
    const nextState = !channel.autoPublishDaily
    try {
      const res = await fetch('/api/youtube/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_auto_pilot',
          autoPublishDaily: nextState,
          approvalMode: channel.approvalMode,
          dailyPostTime: channel.dailyPostTime,
        }),
      })
      const data = await res.json()
      if (data.channelState) setChannel(data.channelState)
      setNotice(nextState ? 'Auto-Pilot Activated: Creating and posting daily Christian content.' : 'Auto-Pilot Paused.')
    } catch (e: any) {
      setNotice(e.message)
    }
  }

  // Trigger Instant Daily Post
  async function triggerDailyPostNow() {
    setBusyAction('trigger_daily')
    setNotice('Triggering daily post cycle...')
    try {
      const res = await fetch('/api/youtube/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger_daily_run' }),
      })
      const data = await res.json()
      if (data.channelState) setChannel(data.channelState)
      setNotice('Daily content posted to YouTube! Monetization metrics updated.')
    } catch (e: any) {
      setNotice(e.message)
    } finally {
      setBusyAction(null)
    }
  }

  // Generate Long-form 16:9 Thumbnail (Nano Banana 2.1 2K)
  async function generateLongThumbnail(variant: 'A' | 'B' = 'A') {
    if (!selected) return
    setBusyAction(`thumbnail_${variant}`)
    setNotice(`Generating high-CTR 16:9 thumbnail (${variant}) with Nano Banana 2.1...`)
    try {
      const res = await fetch('/api/youtube/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selected.title,
          variant,
          aspectRatio: '16:9',
          imageSize: '2K',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to render thumbnail')

      if (data.imageUrl) {
        const updated = {
          ...selected,
          ...(variant === 'A' ? { thumbnailUrl: data.imageUrl } : { thumbnailVariantB: data.imageUrl }),
          stage: 'THUMBNAIL',
        }
        setSelected(updated)
        setVideos((items) => items.map((i) => (i.id === selected.id ? updated : i)))
        setNotice(`Variant ${variant} thumbnail ready.`)
      }
    } catch (err: any) {
      setNotice(`Thumbnail error: ${err.message}`)
    } finally {
      setBusyAction(null)
    }
  }

  // Generate Omni Flash Motion Video
  async function generateOmniVideo() {
    if (!selected) return
    setBusyAction('video')
    const aspect = selected.format === 'SHORT' ? '9:16' : '16:9'
    setNotice(`Generating motion video with Omni Flash (${aspect})...`)
    try {
      const prompt = `Cinematic YouTube scene for topic: "${selected.topic || selected.title}". Scripture atmosphere, golden divine light rays, peaceful flowing water, 720p.`
      const res = await fetch('/api/gemini/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio: aspect,
          duration: '5s',
          resolution: '720p',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate video')

      if (data.videoUrl) {
        const updated = {
          ...selected,
          videoUrl: data.videoUrl,
          aspectRatio: aspect as any,
          stage: 'VIDEO',
        }
        setSelected(updated)
        setVideos((items) => items.map((i) => (i.id === selected.id ? updated : i)))
        setNotice('Video generated successfully.')
      }
    } catch (err: any) {
      setNotice(`Video error: ${err.message}`)
    } finally {
      setBusyAction(null)
    }
  }

  const subsPercent = Math.min(100, Math.round((channel.subscribers / channel.monetizationGoal.subsNeeded) * 100))
  const watchPercent = Math.min(100, Math.round((channel.watchHours / channel.monetizationGoal.watchHoursNeeded) * 100))

  return (
    <div className="space-y-4">
      {/* Sleek, Non-Bulky Monetization & Auto-Pilot Strip */}
      <div className="rounded-lg bg-[#0f131a] border border-[#1a202c] p-3.5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">YouTube OS</span>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 rounded">
                Christian Niche Monetization
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">RPM $14.20</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated Christian content pipeline. Creates &amp; posts daily to reach 1,000 subscribers and 4,000 watch hours.
            </p>
          </div>

          {/* Quick Auto-Pilot Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleAutoPilot}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                channel.autoPublishDaily
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <Radio className={`size-3 ${channel.autoPublishDaily ? 'animate-pulse text-emerald-400' : ''}`} />
              <span>Daily Auto-Pilot: {channel.autoPublishDaily ? 'Active' : 'Off'}</span>
            </button>

            <button
              onClick={triggerDailyPostNow}
              disabled={busyAction !== null}
              className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition flex items-center gap-1 shrink-0 disabled:opacity-50"
            >
              {busyAction === 'trigger_daily' ? <Loader2 className="size-3 animate-spin" /> : <Zap className="size-3" />}
              <span>Post Today Now</span>
            </button>
          </div>
        </div>

        {/* Compact Monetization Metrics Gauge */}
        <div className="mt-3 pt-2.5 border-t border-[#1a202c] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-md bg-[#090b10] border border-[#1a202c]">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Subscribers</span>
              <span className="font-mono text-white font-semibold">{channel.subscribers} / 1,000 ({subsPercent}%)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${subsPercent}%` }} />
            </div>
          </div>

          <div className="p-2 rounded-md bg-[#090b10] border border-[#1a202c]">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Watch Hours</span>
              <span className="font-mono text-white font-semibold">{channel.watchHours} / 4,000 ({watchPercent}%)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${watchPercent}%` }} />
            </div>
          </div>

          <div className="p-2 rounded-md bg-[#090b10] border border-[#1a202c]">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Algorithm Score</span>
            <p className="text-xs font-semibold text-amber-400 mt-0.5">{channel.algorithmHealthScore}/100 Retention</p>
          </div>

          <div className="p-2 rounded-md bg-[#090b10] border border-[#1a202c]">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Daily Schedule</span>
            <p className="text-xs font-semibold text-slate-300 mt-0.5">1 Long + 2 Shorts ({channel.dailyPostTime})</p>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-2.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-medium flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-blue-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Straight-to-the-Point Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#1a202c] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'trends'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Flame className="size-3.5" />
          <span>Christian Content Discovery ({trends.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'pipeline'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="size-3.5" />
          <span>Active Pipeline ({videos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('thumbnails')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'thumbnails'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ImageIcon className="size-3.5" />
          <span>Long Video Thumbnail Studio (16:9)</span>
        </button>
      </div>

      {/* TAB 1: CHRISTIAN CONTENT DISCOVERY */}
      {activeTab === 'trends' && (
        <div className="space-y-3.5">
          {/* Compact Prompt Bar */}
          <div className="p-3.5 rounded-lg bg-[#0f131a] border border-[#1a202c] space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={christianPrompt}
                onChange={(e) => setChristianPrompt(e.target.value)}
                placeholder="Find best selling Christian content (e.g. sleep prayers, prophetic encouragement)..."
                className="flex-1 bg-[#090b10] border border-[#1a202c] rounded-md px-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && fetchChristianTrends()}
              />
              <button
                onClick={() => fetchChristianTrends()}
                disabled={loadingTrends}
                className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                {loadingTrends ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
                <span>Find Topics</span>
              </button>
            </div>

            {/* Compact Filter Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-mono">Presets:</span>
              {[
                { label: 'Sleep Prayers (4,000h)', q: 'Listen to this prayer before you sleep Psalm 91 deep peace' },
                { label: 'Prophetic Message (High CTR)', q: 'God says stop worrying I have prepared your breakthrough' },
                { label: 'Biblical Mysteries', q: 'Hidden biblical mysteries and archaeological discoveries in Revelation' },
                { label: '60s Shorts (Subs Rocket)', q: '3 things that happen when you pray in faith Christian shorts' },
                { label: 'Warfare & Morning Prayers', q: 'Powerful morning prayer declarations and spiritual protection' },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setChristianPrompt(p.q)
                    fetchChristianTrends(p.q)
                  }}
                  className="px-2 py-0.5 rounded text-[11px] bg-[#090b10] hover:bg-slate-800 text-slate-300 border border-[#1a202c] transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* High Density Cards Grid */}
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {trends.map((idea) => {
              const isLong = idea.format === 'LONG'
              const isBusy = busyAction === idea.id

              return (
                <div
                  key={idea.id}
                  className="rounded-lg bg-[#0f131a] border border-[#1a202c] p-3.5 flex flex-col justify-between hover:border-slate-700 transition shadow-xs space-y-2.5"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span
                        className={`font-semibold px-1.5 py-0.2 rounded ${
                          isLong
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                            : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                        }`}
                      >
                        {isLong ? '16:9 Long (Watch Hours)' : '9:16 Short (Subscribers)'}
                      </span>
                      <span className="font-mono text-amber-400 font-bold">
                        {idea.algorithmViralityScore}/100 Virality
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                      {idea.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {idea.topic}
                    </p>

                    <div className="p-2 rounded bg-[#090b10] border border-[#1a202c] grid grid-cols-2 gap-1 text-[10px]">
                      <div>
                        <span className="text-slate-500">Watch Hours: </span>
                        <span className="text-emerald-400 font-mono font-semibold">+{idea.projectedWatchHours}h</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Subs: </span>
                        <span className="text-blue-400 font-mono font-semibold">+{idea.projectedSubs}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => approveAndRunPipeline(idea)}
                    disabled={isBusy}
                    className="w-full py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs"
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="size-3 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Check className="size-3" />
                        <span>Approve &amp; Auto-Run Pipeline</span>
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE PIPELINE & WORKFLOWS */}
      {activeTab === 'pipeline' && (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.8fr]">
          {/* Left: Queue List */}
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-[#0f131a] border border-[#1a202c] flex items-center justify-between text-xs">
              <span className="font-bold text-white">Queued Content</span>
              <button onClick={loadVideos} className="text-slate-400 hover:text-white">
                <RefreshCw className="size-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              {videos.map((vid) => {
                const isSelected = selected?.id === vid.id
                return (
                  <button
                    key={vid.id}
                    onClick={() => setSelected(vid)}
                    className={`w-full p-2.5 rounded-lg text-left border transition-all text-xs ${
                      isSelected
                        ? 'bg-blue-950/25 border-blue-500 text-white'
                        : 'bg-[#0f131a] border-[#1a202c] text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-mono">{vid.format || 'LONG'}</span>
                      <span className="text-emerald-400 font-semibold">{vid.status || 'SCHEDULED'}</span>
                    </div>
                    <p className="font-medium text-white mt-1 line-clamp-1">{vid.title}</p>
                  </button>
                )
              })}

              {videos.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500 bg-[#0f131a] rounded-lg border border-[#1a202c]">
                  No workflows queued yet.
                </div>
              )}
            </div>
          </div>

          {/* Right: Selected Video Workbench */}
          <div className="p-4 rounded-lg bg-[#0f131a] border border-[#1a202c] space-y-4">
            {selected ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-blue-400 uppercase">{selected.format || 'LONG'} Format</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{selected.title}</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {selected.status || 'SCHEDULED'}
                  </span>
                </div>

                {/* Pipeline Stepper */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[10px]">
                  {pipelineStages.map((stage) => {
                    const done = Boolean(
                      (stage.key === 'RESEARCH' && selected.research) ||
                      (stage.key === 'SCRIPT' && selected.script) ||
                      (stage.key === 'VIDEO' && selected.videoUrl) ||
                      (stage.key === 'THUMBNAIL' && selected.thumbnailUrl) ||
                      (stage.key === 'UPLOAD' && selected.status === 'SCHEDULED')
                    )
                    return (
                      <div
                        key={stage.key}
                        className={`p-1.5 rounded border text-center font-medium ${
                          done ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-[#090b10] border-[#1a202c] text-slate-500'
                        }`}
                      >
                        {stage.label}
                      </div>
                    )
                  })}
                </div>

                {/* Video Preview */}
                <div className="p-3 rounded-lg bg-[#090b10] border border-[#1a202c] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Omni Flash Motion Video</span>
                    {!selected.videoUrl && (
                      <button
                        onClick={generateOmniVideo}
                        disabled={busyAction !== null}
                        className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-medium"
                      >
                        {busyAction === 'video' ? 'Synthesizing...' : 'Generate Video'}
                      </button>
                    )}
                  </div>

                  {selected.videoUrl ? (
                    <div className="space-y-2">
                      <video
                        key={selected.videoUrl}
                        src={selected.videoUrl}
                        controls
                        autoPlay
                        muted
                        playsInline
                        loop
                        className="max-h-[260px] w-auto mx-auto rounded border border-slate-800"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => downloadMedia(selected.videoUrl, `youtube-${selected.id}.mp4`)}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1"
                        >
                          <Download className="size-3" /> Download MP4
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 text-center py-4">Click Generate to synthesize motion video.</p>
                  )}
                </div>

                {/* Thumbnail Preview */}
                <div className="p-3 rounded-lg bg-[#090b10] border border-[#1a202c] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">16:9 2K Thumbnail (Nano Banana 2.1)</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => generateLongThumbnail('A')}
                        disabled={busyAction !== null}
                        className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px]"
                      >
                        Generate A
                      </button>
                      <button
                        onClick={() => generateLongThumbnail('B')}
                        disabled={busyAction !== null}
                        className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[11px]"
                      >
                        Generate B
                      </button>
                    </div>
                  </div>

                  {selected.thumbnailUrl ? (
                    <div className="space-y-2">
                      <img
                        src={selected.thumbnailUrl}
                        alt="Thumbnail"
                        className="w-full max-h-[240px] object-cover rounded border border-slate-800"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => downloadMedia(selected.thumbnailUrl, `thumbnail-${selected.id}.png`)}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1"
                        >
                          <Download className="size-3" /> Download 2K PNG
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 text-center py-4">Click Generate to create thumbnail.</p>
                  )}
                </div>

                {/* Script */}
                {selected.script && (
                  <div className="p-3 rounded-lg bg-[#090b10] border border-[#1a202c] space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Retention Script</span>
                    <textarea
                      value={selected.script}
                      onChange={(e) => setSelected({ ...selected, script: e.target.value })}
                      className="w-full min-h-36 rounded bg-[#0b0e14] border border-[#1a202c] p-2.5 text-xs font-mono text-slate-300 outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-xs text-slate-500 py-12">Select a video to inspect.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LONG VIDEO THUMBNAIL STUDIO */}
      {activeTab === 'thumbnails' && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-[#0f131a] border border-[#1a202c] text-xs">
            <span className="font-bold text-white">Long Video Thumbnail Studio (16:9 2K)</span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Engineered specifically for Christian long-form videos to maximize Click-Through Rate (CTR).
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Variant A */}
            <div className="p-3.5 rounded-lg bg-[#0f131a] border border-[#1a202c] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-400">Variant A (Divine Light Beam)</span>
                <button
                  onClick={() => generateLongThumbnail('A')}
                  disabled={busyAction !== null}
                  className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-[11px] font-medium"
                >
                  Generate A
                </button>
              </div>

              {selected?.thumbnailUrl ? (
                <div className="space-y-2">
                  <img src={selected.thumbnailUrl} alt="Variant A" className="w-full aspect-video object-cover rounded border border-slate-800" />
                  <button
                    onClick={() => downloadMedia(selected.thumbnailUrl, 'thumbnail-variant-A.png')}
                    className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white flex items-center justify-center gap-1"
                  >
                    <Download className="size-3" /> Download 2K PNG
                  </button>
                </div>
              ) : (
                <div className="aspect-video rounded bg-[#090b10] border border-[#1a202c] flex items-center justify-center text-xs text-slate-500">
                  Click Generate A to render.
                </div>
              )}
            </div>

            {/* Variant B */}
            <div className="p-3.5 rounded-lg bg-[#0f131a] border border-[#1a202c] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-400">Variant B (Dramatic Silhouette)</span>
                <button
                  onClick={() => generateLongThumbnail('B')}
                  disabled={busyAction !== null}
                  className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 text-[11px] font-medium"
                >
                  Generate B
                </button>
              </div>

              {selected?.thumbnailVariantB ? (
                <div className="space-y-2">
                  <img src={selected.thumbnailVariantB} alt="Variant B" className="w-full aspect-video object-cover rounded border border-slate-800" />
                  <button
                    onClick={() => downloadMedia(selected.thumbnailVariantB, 'thumbnail-variant-B.png')}
                    className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white flex items-center justify-center gap-1"
                  >
                    <Download className="size-3" /> Download 2K PNG
                  </button>
                </div>
              ) : (
                <div className="aspect-video rounded bg-[#090b10] border border-[#1a202c] flex items-center justify-center text-xs text-slate-500">
                  Click Generate B for A/B testing.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
