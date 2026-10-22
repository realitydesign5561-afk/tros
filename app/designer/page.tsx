'use client'

import { useState, useRef } from 'react'
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Send,
  ArrowRight,
  Loader2,
  Video,
  Download,
  Ratio,
  Maximize2,
  CheckCircle2,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react'

export default function ConversationalDesigner() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    {
      role: 'agent',
      text: 'Welcome to Creative Studio. Powered by Gemini Nano Banana 2.1 for ultra-high-definition flyers, product graphics, and social banners. You can also animate any design into video using Omni Flash!',
    },
  ])
  const [input, setInput] = useState('')
  const [versions, setVersions] = useState<string[]>([])
  const [activeVersion, setActiveVersion] = useState(0)
  const [loading, setLoading] = useState(false)
  const [animatingVideo, setAnimatingVideo] = useState(false)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null)
  const [uploadedMimeType, setUploadedMimeType] = useState('image/png')
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1')
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K')
  const [videoPrompt, setVideoPrompt] = useState('Cinematic camera push-in with gentle floating atmospheric light particles.')
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16'>('16:9')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setUploadedImage(url)
      setUploadedMimeType(file.type || 'image/png')
      const reader = new FileReader()
      reader.onload = () => {
        const b64 = reader.result as string
        setUploadedBase64(b64)
      }
      reader.readAsDataURL(file)
      setVersions([url])
      setActiveVersion(0)
      setMessages((m) => [
        ...m,
        { role: 'user', text: `[Uploaded Image: ${file.name}]` },
        {
          role: 'agent',
          text: `Base image loaded! How would you like me to edit or restyle it? (Using gemini-nano-banana-2.1 with ${aspectRatio} aspect ratio at ${imageSize} resolution)`,
        },
      ])
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const currentInput = input
    setMessages((m) => [...m, { role: 'user', text: currentInput }])
    setInput('')
    setLoading(true)

    try {
      // Direct call to Gemini Nano Banana 2.1
      const res = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentInput,
          referenceImageBase64: uploadedBase64 || (versions[activeVersion]?.startsWith('data:') ? versions[activeVersion] : undefined),
          referenceMimeType: uploadedMimeType,
          aspectRatio,
          imageSize,
          enableSearchGrounding: true,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate design')
      }

      if (data.imageUrl) {
        setVersions((v) => [...v, data.imageUrl])
        setActiveVersion((v) => v.length)
        setMessages((m) => [
          ...m,
          {
            role: 'agent',
            text: `✨ Rendered with gemini-nano-banana-2.1 (${imageSize}, ${aspectRatio}). ${data.text || 'Design updated!'}`,
          },
        ])
      } else if (data.text) {
        setMessages((m) => [...m, { role: 'agent', text: data.text }])
      }
    } catch (err: any) {
      // Fallback to general designer API if needed
      try {
        const formData = new FormData()
        formData.append('prompt', currentInput)
        formData.append('provider', 'automatic')
        formData.append('format', 'png')
        const resFallback = await fetch('/api/designer', {
          method: 'POST',
          body: formData,
        })
        const dataFallback = await resFallback.json()
        if (dataFallback.outputUrl) {
          setVersions((v) => [...v, dataFallback.outputUrl])
          setActiveVersion((v) => v.length)
          setMessages((m) => [
            ...m,
            { role: 'agent', text: 'Design created via AI Gateway fallback.' },
          ])
          return
        }
      } catch {
        // ignore secondary
      }
      setMessages((m) => [...m, { role: 'agent', text: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  // Animate Image into Video with Gemini Omni Flash
  const animateCurrentDesign = async () => {
    const currentImg = versions[activeVersion] || uploadedBase64
    if (!currentImg) {
      alert('Please generate or upload an image first to animate it into a video.')
      return
    }

    setAnimatingVideo(true)
    setGeneratedVideoUrl(null)
    setMessages((m) => [
      ...m,
      {
        role: 'user',
        text: `Animate this design into video (${videoAspect}) using Gemini Omni Flash: "${videoPrompt}"`,
      },
      {
        role: 'agent',
        text: 'Generating motion video with gemini-omni-1.1-flash via the Interactions API... This may take up to 30-60 seconds.',
      },
    ])

    try {
      const res = await fetch('/api/gemini/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          referenceImageBase64: currentImg,
          referenceMimeType: 'image/png',
          aspectRatio: videoAspect,
          duration: '5s',
          resolution: '720p',
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to animate video with Omni Flash')
      }

      if (data.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl)
        setMessages((m) => [
          ...m,
          {
            role: 'agent',
            text: `🎬 Video animation complete with gemini-omni-1.1-flash! Aspect ratio: ${videoAspect}. Check preview on the right.`,
          },
        ])
      }
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        { role: 'agent', text: `Video animation error: ${err.message}` },
      ])
    } finally {
      setAnimatingVideo(false)
    }
  }

  const undo = () => setActiveVersion(Math.max(0, activeVersion - 1))
  const redo = () => setActiveVersion(Math.min(versions.length - 1, activeVersion + 1))

  return (
    <div className="flex h-screen bg-[#0e100f] text-white p-3 md:p-6">
      <div className="flex w-full h-full bg-[#141615] rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden">
        {/* Left Chat & Controls Panel */}
        <div className="w-full md:w-[420px] border-r border-white/10 bg-[#141615] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-[#eaf79f] text-black rounded-xl flex items-center justify-center font-bold">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white">Creative Studio</h2>
                  <p className="text-[11px] text-white/50">Gemini Nano Banana 2.1 & Omni Flash</p>
                </div>
              </div>
            </div>

            {/* Model & Aspect Ratio Config Bar */}
            <div className="p-4 bg-white/5 border-b border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                <span className="flex items-center gap-1.5">
                  <Ratio className="size-3.5 text-[#eaf79f]" /> Aspect Ratio
                </span>
                <div className="flex gap-1">
                  {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                        aspectRatio === ratio
                          ? 'bg-[#eaf79f] text-black'
                          : 'bg-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="size-3.5 text-[#eaf79f]" /> Resolution
                </span>
                <div className="flex gap-1">
                  {(['1K', '2K', '4K'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setImageSize(sz)}
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition ${
                        imageSize === sz
                          ? 'bg-white text-black'
                          : 'bg-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="p-4 space-y-4 max-h-[calc(100vh-22rem)] overflow-y-auto">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed max-w-[88%] ${
                    m.role === 'user'
                      ? 'bg-white text-black ml-auto'
                      : 'bg-white/5 border border-white/10 text-white/90 shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {loading && (
                <div className="p-3.5 rounded-2xl max-w-[85%] bg-white/5 border border-white/10 flex items-center gap-2 text-xs text-white/60">
                  <Loader2 className="size-4 animate-spin text-[#eaf79f]" />
                  <span>Synthesizing with gemini-nano-banana-2.1 ({imageSize})...</span>
                </div>
              )}
              {animatingVideo && (
                <div className="p-3.5 rounded-2xl max-w-[85%] bg-white/5 border border-purple-500/30 flex items-center gap-2 text-xs text-purple-300">
                  <Loader2 className="size-4 animate-spin text-purple-400" />
                  <span>Generating motion with gemini-omni-1.1-flash...</span>
                </div>
              )}
            </div>
          </div>

          {/* Prompt & Input Box */}
          <div className="p-4 bg-black/40 border-t border-white/10">
            {uploadedImage && (
              <div className="flex items-center gap-2 mb-2 p-1.5 bg-white/5 rounded-xl border border-white/10">
                <img src={uploadedImage} alt="Ref" className="size-8 rounded-lg object-cover" />
                <span className="text-[11px] text-white/70 truncate flex-1">Reference image active for editing</span>
                <button
                  onClick={() => {
                    setUploadedImage(null)
                    setUploadedBase64(null)
                  }}
                  className="text-xs text-white/40 hover:text-white px-1.5"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="relative flex items-center bg-white/5 rounded-2xl border border-white/15 focus-within:border-[#eaf79f] transition-all p-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-white/50 hover:text-white transition"
                title="Upload image to edit with Gemini"
              >
                <Upload className="size-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />

              <input
                className="flex-1 bg-transparent px-2 text-xs sm:text-sm font-medium outline-none text-white placeholder:text-white/40"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Luxury real estate flyer with gold foil..."
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />

              <button
                className="p-3 bg-[#eaf79f] text-black rounded-xl hover:brightness-95 transition disabled:opacity-40 font-bold"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Canvas & Video Preview Panel */}
        <div className="flex-1 flex flex-col p-6 bg-[#0a0c0b] relative overflow-y-auto">
          {/* Top Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={undo}
                disabled={activeVersion === 0 || versions.length === 0}
                className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold disabled:opacity-40 hover:bg-white/20 transition"
              >
                Undo
              </button>
              <button
                onClick={redo}
                disabled={activeVersion === versions.length - 1 || versions.length === 0}
                className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold disabled:opacity-40 hover:bg-white/20 transition"
              >
                Redo
              </button>
              {versions.length > 0 && (
                <span className="text-xs text-white/40 font-mono ml-2">
                  v{activeVersion + 1} of {versions.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Animate into Video Omni Flash CTA */}
              {versions.length > 0 && (
                <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 p-1 rounded-full">
                  <select
                    value={videoAspect}
                    onChange={(e) => setVideoAspect(e.target.value as any)}
                    className="bg-transparent text-[11px] font-bold text-purple-300 px-2 outline-none cursor-pointer"
                  >
                    <option value="16:9" className="bg-[#141615]">16:9 YouTube</option>
                    <option value="9:16" className="bg-[#141615]">9:16 Shorts</option>
                  </select>
                  <button
                    onClick={animateCurrentDesign}
                    disabled={animatingVideo}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-full transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    <Video className="size-3.5" />
                    <span>Animate Video (Omni Flash)</span>
                  </button>
                </div>
              )}

              {versions.length > 0 && (
                <a
                  href={versions[activeVersion]}
                  download={`tros-design-${activeVersion + 1}.png`}
                  className="px-5 py-2 bg-[#eaf79f] text-black font-bold text-xs rounded-full hover:brightness-95 transition flex items-center gap-1.5 shadow-md"
                >
                  <Download className="size-3.5" />
                  Download PNG
                </a>
              )}
            </div>
          </div>

          {/* Visual Display: Image & Generated Video */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[460px]">
            {/* Image Canvas */}
            <div className="bg-[#141615] rounded-[2rem] border border-white/10 p-4 flex flex-col items-center justify-center overflow-hidden relative shadow-inner">
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 px-2.5 py-1 rounded-full border border-white/10 text-white/80">
                  Graphic Canvas
                </span>
                {versions[activeVersion] && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#eaf79f]/20 text-[#eaf79f] px-2 py-0.5 rounded-full">
                    {aspectRatio} · {imageSize}
                  </span>
                )}
              </div>

              {versions.length > 0 ? (
                <img
                  src={versions[activeVersion]}
                  alt="Active Design"
                  className="max-w-full max-h-[500px] object-contain rounded-2xl shadow-2xl"
                />
              ) : (
                <div className="text-center text-white/40 flex flex-col items-center p-8">
                  <ImageIcon className="size-14 mb-3 opacity-30 text-[#eaf79f]" />
                  <p className="font-semibold text-sm">No design rendered yet</p>
                  <p className="text-xs text-white/30 max-w-xs mt-1">
                    Upload a flyer to restyle or enter a prompt on the left to generate with Gemini Nano Banana 2.1.
                  </p>
                </div>
              )}
            </div>

            {/* Omni Flash Video Preview */}
            <div className="bg-[#141615] rounded-[2rem] border border-white/10 p-4 flex flex-col items-center justify-center overflow-hidden relative shadow-inner">
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 px-2.5 py-1 rounded-full border border-white/10 text-white/80 flex items-center gap-1.5">
                  <Video className="size-3 text-purple-400" /> Omni Flash Motion Video
                </span>
                {generatedVideoUrl && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                    720p · {videoAspect}
                  </span>
                )}
              </div>

              {generatedVideoUrl ? (
                <div className="w-full flex flex-col items-center justify-center space-y-3">
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="max-w-full max-h-[460px] rounded-2xl border border-white/10 shadow-2xl"
                  />
                  <a
                    href={generatedVideoUrl}
                    download="tros-animated-video.mp4"
                    className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1.5"
                  >
                    <Download className="size-3.5" /> Download Video MP4
                  </a>
                </div>
              ) : (
                <div className="text-center text-white/40 flex flex-col items-center p-8">
                  <Play className="size-14 mb-3 opacity-30 text-purple-400" />
                  <p className="font-semibold text-sm">Omni Flash Video Standby</p>
                  <p className="text-xs text-white/30 max-w-xs mt-1">
                    When you click &quot;Animate Video&quot;, Gemini Omni Flash generates motion frames directly from your active image using the Interactions API.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
