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
} from 'lucide-react'

type Asset = { id: string; type: string; status: string; url?: string; provider?: string | null }
type Video = {
  id: string
  title: string
  topic: string
  stage: string
  status: string
  research?: string | null
  script?: string | null
  videoUrl?: string | null
  thumbnailUrl?: string | null
  audioUrl?: string | null
  aspectRatio?: '16:9' | '9:16'
  assets: Asset[]
  views: number
  likes: number
  comments: number
}

const stages = [
  { key: 'RESEARCH', label: 'Research', icon: Search },
  { key: 'SCRIPT', label: 'AI Script', icon: FileText },
  { key: 'VOICEOVER', label: 'Voiceover', icon: Mic2 },
  { key: 'VIDEO', label: 'Omni Video', icon: VideoIcon },
  { key: 'THUMBNAIL', label: 'Nano Thumbnail', icon: ImageIcon },
  { key: 'UPLOAD', label: 'Upload Ready', icon: Upload },
]

export function YouTubeOS() {
  const [videos, setVideos] = useState<Video[]>([])
  const [topic, setTopic] = useState('')
  const [selected, setSelected] = useState<Video | null>(null)
  const [notice, setNotice] = useState('')
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9')
  const [busyAction, setBusyAction] = useState<string | null>(null)

  async function load() {
    try {
      const res = await fetch('/api/youtube')
      if (res.ok) setVideos(await res.json())
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function create() {
    if (!topic.trim()) return
    setNotice('Creating workflow...')
    try {
      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })
      const data = await res.json()
      if (!res.ok) return setNotice(data.error)
      setVideos((v) => [data, ...v])
      setSelected(data)
      setTopic('')
      setNotice('Video workflow created. Start with research.')
    } catch (err: any) {
      setNotice(err.message || 'Failed to create workflow')
    }
  }

  async function generate(kind: 'research' | 'script') {
    if (!selected) return
    setBusyAction(kind)
    setNotice(kind === 'research' ? 'Researching topic with AI...' : 'Writing script...')
    try {
      const res = await fetch('/api/youtube/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, kind }),
      })
      const data = await res.json()
      if (!res.ok) {
        setNotice(data.error)
        return
      }
      setSelected(data)
      setVideos((items) => items.map((item) => (item.id === data.id ? data : item)))
      setNotice(
        kind === 'research'
          ? 'Research ready. Review it, then generate the script.'
          : 'Script ready for voiceover and video production.'
      )
    } catch (err: any) {
      setNotice(err.message || 'Generation error')
    } finally {
      setBusyAction(null)
    }
  }

  // Generate Video with Gemini Omni Flash
  async function generateVideo() {
    if (!selected) return
    setBusyAction('video')
    setNotice(`Synthesizing motion video with gemini-omni-1.1-flash (${aspectRatio})... This may take 30-60s.`)
    try {
      const prompt = `Cinematic YouTube video scene for topic: "${selected.topic}". Script snippet: "${(selected.script || selected.topic).slice(0, 180)}". Hyper-realistic, professional lighting, fluid cinematic motion.`
      const res = await fetch('/api/gemini/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio,
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
          aspectRatio,
          stage: 'VIDEO',
        }
        setSelected(updated)
        setVideos((items) => items.map((item) => (item.id === selected.id ? updated : item)))
        setNotice('Omni Flash video generated successfully! Preview it below.')
      }
    } catch (err: any) {
      setNotice(`Video generation error: ${err.message}`)
    } finally {
      setBusyAction(null)
    }
  }

  // Generate Thumbnail with Gemini Nano Banana 2.1
  async function generateThumbnail() {
    if (!selected) return
    setBusyAction('thumbnail')
    setNotice('Generating high-CTR thumbnail with gemini-nano-banana-2.1 (16:9, 2K)...')
    try {
      const prompt = `Eye-catching YouTube thumbnail for topic: "${selected.topic}". Bold contrast, expressive visual hierarchy, vibrant studio lighting, clean focal point, no cluttered small text.`
      const res = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio: '16:9',
          imageSize: '2K',
          enableSearchGrounding: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate thumbnail')

      if (data.imageUrl) {
        const updated = {
          ...selected,
          thumbnailUrl: data.imageUrl,
          stage: 'THUMBNAIL',
        }
        setSelected(updated)
        setVideos((items) => items.map((item) => (item.id === selected.id ? updated : item)))
        setNotice('Thumbnail generated with gemini-nano-banana-2.1!')
      }
    } catch (err: any) {
      setNotice(`Thumbnail error: ${err.message}`)
    } finally {
      setBusyAction(null)
    }
  }

  // Generate Voiceover with Gemini 3.8 Flash Lite TTS
  async function generateVoiceover() {
    if (!selected || !selected.script) return
    setBusyAction('voiceover')
    setNotice('Synthesizing voiceover audio with gemini-3.8-flash-lite-tts...')
    try {
      const res = await fetch('/api/gemini/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selected.script.slice(0, 500),
          voiceName: 'Kore',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to synthesize voiceover')

      if (data.audioUrl) {
        const updated = {
          ...selected,
          audioUrl: data.audioUrl,
          stage: 'VOICEOVER',
        }
        setSelected(updated)
        setVideos((items) => items.map((item) => (item.id === selected.id ? updated : item)))
        setNotice('Voiceover synthesized successfully with Gemini 3.8 TTS!')
      }
    } catch (err: any) {
      setNotice(`Voiceover error: ${err.message}`)
    } finally {
      setBusyAction(null)
    }
  }

  const currentStage = selected ? stages.findIndex((stage) => stage.key === selected.stage) : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
              Gemini Omni Flash + Nano Banana
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Faceless YouTube OS</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-white/60">
            End-to-end production: Research, script, voiceover, Omni Flash video generation, and Nano Banana thumbnails.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.55fr]">
        {/* Left: Workflow Creator & List */}
        <section className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#141615] p-5 shadow-sm text-white">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <WandSparkles className="size-4 text-[#eaf79f]" />
              Start a New Production
            </div>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Why calm systems beat hustle culture in modern software engineering"
              className="mt-3 min-h-24 w-full resize-none rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#eaf79f]"
            />
            <button
              onClick={create}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#eaf79f] px-4 py-2.5 text-sm font-bold text-black hover:brightness-95 transition"
            >
              <Play className="size-4" />
              Create Video Workflow
            </button>
            {notice && <p className="mt-3 text-xs text-[#eaf79f] font-medium">{notice}</p>}
          </div>

          <div className="space-y-2">
            {videos.map((video) => (
              <button
                key={video.id}
                onClick={() => setSelected(video)}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${
                  selected?.id === video.id
                    ? 'border-[#eaf79f] bg-white/10 text-white'
                    : 'border-white/10 bg-[#141615] text-white/80 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="truncate pr-4 text-sm font-bold text-white">{video.title}</p>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-[#eaf79f]">
                    {video.stage}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/50">{video.topic}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Right: Production Pipeline Stage Details */}
        <section className="rounded-2xl border border-white/10 bg-[#141615] p-6 text-white shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/50 font-bold">
                Production Pipeline
              </p>
              <h3 className="mt-1 text-xl font-bold">{selected?.title ?? 'Select a video workflow'}</h3>
            </div>
            {selected && (
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                {selected.status}
              </span>
            )}
          </div>

          {selected ? (
            <>
              {/* Stages Bar */}
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                {stages.map((stage, index) => {
                  const Icon = stage.icon
                  const done = index < currentStage
                  const active = index === currentStage
                  return (
                    <div
                      key={stage.key}
                      className={`rounded-xl border p-3 transition-colors ${
                        active
                          ? 'border-[#eaf79f] bg-[#eaf79f]/10 text-white'
                          : done
                          ? 'border-emerald-500/40 bg-emerald-500/5 text-white/80'
                          : 'border-white/10 bg-white/5 text-white/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="size-4 text-[#eaf79f]" />
                        {done && <Check className="size-3.5 text-emerald-400" />}
                      </div>
                      <p className="mt-2 text-xs font-bold">{stage.label}</p>
                    </div>
                  )
                })}
              </div>

              {/* Action Toolbar */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => generate('research')}
                    disabled={busyAction !== null}
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10 disabled:opacity-40 transition"
                  >
                    {busyAction === 'research' ? <Loader2 className="size-3.5 animate-spin inline mr-1" /> : null}
                    1. Generate Research
                  </button>

                  <button
                    onClick={() => generate('script')}
                    disabled={!selected.research || busyAction !== null}
                    className="rounded-xl bg-white text-black px-3.5 py-2 text-xs font-bold hover:bg-[#eaf79f] disabled:opacity-40 transition"
                  >
                    {busyAction === 'script' ? <Loader2 className="size-3.5 animate-spin inline mr-1" /> : null}
                    2. Generate AI Script
                  </button>

                  <button
                    onClick={generateVoiceover}
                    disabled={!selected.script || busyAction !== null}
                    className="rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 px-3.5 py-2 text-xs font-bold hover:bg-sky-500/30 disabled:opacity-40 transition"
                  >
                    {busyAction === 'voiceover' ? <Loader2 className="size-3.5 animate-spin inline mr-1" /> : null}
                    3. Voiceover (TTS)
                  </button>

                  {/* Format Selector */}
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as any)}
                    className="rounded-xl bg-white/10 border border-white/10 px-2 py-2 text-xs font-bold text-white outline-none cursor-pointer"
                  >
                    <option value="16:9" className="bg-[#141615]">16:9 YouTube</option>
                    <option value="9:16" className="bg-[#141615]">9:16 Shorts</option>
                  </select>

                  <button
                    onClick={generateVideo}
                    disabled={busyAction !== null}
                    className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40 shadow-lg"
                  >
                    {busyAction === 'video' ? <Loader2 className="size-3.5 animate-spin" /> : <VideoIcon className="size-3.5" />}
                    4. Render Video (Omni Flash)
                  </button>

                  <button
                    onClick={generateThumbnail}
                    disabled={busyAction !== null}
                    className="rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3.5 py-2 text-xs font-bold hover:bg-amber-500/30 transition flex items-center gap-1.5 disabled:opacity-40"
                  >
                    {busyAction === 'thumbnail' ? <Loader2 className="size-3.5 animate-spin" /> : <ImageIcon className="size-3.5" />}
                    5. Thumbnail (Nano Banana)
                  </button>
                </div>

                {/* Generated Video Player Preview */}
                {selected.videoUrl && (
                  <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <VideoIcon className="size-3.5" /> Generated with Gemini Omni Flash
                      </span>
                      <a
                        href={selected.videoUrl}
                        download={`youtube-${selected.id}.mp4`}
                        className="text-xs font-bold text-white hover:text-[#eaf79f] flex items-center gap-1"
                      >
                        <Download className="size-3" /> Download MP4
                      </a>
                    </div>
                    <div className="flex justify-center bg-black rounded-xl overflow-hidden">
                      <video
                        src={selected.videoUrl}
                        controls
                        autoPlay
                        loop
                        className="max-h-[360px] w-auto rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {/* Generated Thumbnail Preview */}
                {selected.thumbnailUrl && (
                  <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <ImageIcon className="size-3.5" /> Generated with Gemini Nano Banana 2.1 (2K)
                      </span>
                      <a
                        href={selected.thumbnailUrl}
                        download={`thumbnail-${selected.id}.png`}
                        className="text-xs font-bold text-white hover:text-[#eaf79f] flex items-center gap-1"
                      >
                        <Download className="size-3" /> Download PNG
                      </a>
                    </div>
                    <img
                      src={selected.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-full max-h-[300px] object-cover rounded-xl border border-white/10"
                    />
                  </div>
                )}

                {/* Generated Audio Voiceover Player */}
                {selected.audioUrl && (
                  <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-sky-500/30 space-y-2">
                    <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                      <Mic2 className="size-3.5" /> Voiceover Audio (Gemini 3.8 TTS)
                    </span>
                    <audio src={selected.audioUrl} controls className="w-full" />
                  </div>
                )}

                {/* Research Notes */}
                {selected.research && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                      Research Dossier
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-white/80 bg-white/5 p-4 rounded-xl border border-white/5">
                      {selected.research}
                    </p>
                  </div>
                )}

                {/* Editable Script */}
                {selected.script && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                      Editable Production Script
                    </p>
                    <textarea
                      value={selected.script}
                      onChange={(e) => setSelected({ ...selected, script: e.target.value })}
                      className="mt-2 min-h-48 w-full rounded-xl border border-white/10 bg-black/50 p-4 text-xs sm:text-sm leading-relaxed text-white outline-none focus:border-[#eaf79f]"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex min-h-80 items-center justify-center text-center text-sm text-white/40">
              Create or select a workflow to manage its production stages.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
