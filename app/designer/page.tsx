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

  // Robust blob-based media downloader (prevents Chromium 2MB data: URL download crashes)
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
        setVersions((v) => {
          const next = [...v, data.imageUrl]
          setActiveVersion(next.length - 1)
          return next
        })
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
          setVersions((v) => {
            const next = [...v, dataFallback.outputUrl]
            setActiveVersion(next.length - 1)
            return next
          })
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
    <div className="flex h-[calc(100vh-4rem)] bg-[#090b10] text-slate-200 p-2 sm:p-3">
      <div className="flex w-full h-full bg-[#0f131a] rounded-lg shadow-sm border border-[#1a202c] overflow-hidden">
        {/* Left Chat & Controls Panel (Compact, Non-Bulky) */}
        <div className="w-full md:w-[360px] border-r border-[#1a202c] bg-[#0c0f16] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="p-3 border-b border-[#1a202c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 bg-blue-600 text-white rounded-md flex items-center justify-center font-bold">
                  <Sparkles className="size-3.5" />
                </div>
                <div>
                  <h2 className="font-bold text-xs text-white">Creative Studio</h2>
                  <p className="text-[10px] text-slate-400">Gemini Nano Banana 2.1 &amp; Omni Flash</p>
                </div>
              </div>
            </div>

            {/* Model & Aspect Ratio Config Bar */}
            <div className="p-2.5 bg-[#090b10] border-b border-[#1a202c] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-300">
                <span className="flex items-center gap-1">
                  <Ratio className="size-3 text-blue-400" /> Aspect Ratio
                </span>
                <div className="flex gap-1">
                  {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition ${
                        aspectRatio === ratio
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-medium text-slate-300">
                <span className="flex items-center gap-1">
                  <Maximize2 className="size-3 text-blue-400" /> Resolution
                </span>
                <div className="flex gap-1">
                  {(['1K', '2K', '4K'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setImageSize(sz)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition ${
                        imageSize === sz
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="p-3 space-y-2.5 max-h-[calc(100vh-20rem)] overflow-y-auto">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg text-xs leading-relaxed max-w-[90%] ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white ml-auto'
                      : 'bg-[#12161f] border border-[#1e2533] text-slate-200 shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {loading && (
                <div className="p-2.5 rounded-lg max-w-[85%] bg-[#12161f] border border-[#1e2533] flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="size-3.5 animate-spin text-blue-400" />
                  <span>Synthesizing ({imageSize})...</span>
                </div>
              )}
              {animatingVideo && (
                <div className="p-2.5 rounded-lg max-w-[85%] bg-purple-950/20 border border-purple-500/30 flex items-center gap-2 text-xs text-purple-300">
                  <Loader2 className="size-3.5 animate-spin text-purple-400" />
                  <span>Omni Flash motion rendering...</span>
                </div>
              )}
            </div>
          </div>

          {/* Prompt & Input Box */}
          <div className="p-3 bg-[#090b10] border-t border-[#1a202c]">
            {uploadedImage && (
              <div className="flex items-center gap-2 mb-2 p-1 bg-slate-900 rounded border border-slate-800">
                <img src={uploadedImage} alt="Ref" className="size-7 rounded object-cover" />
                <span className="text-[10px] text-slate-400 truncate flex-1">Reference active</span>
                <button
                  onClick={() => {
                    setUploadedImage(null)
                    setUploadedBase64(null)
                  }}
                  className="text-xs text-slate-500 hover:text-white px-1"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="relative flex items-center bg-[#12161f] rounded-md border border-[#1e2533] focus-within:border-blue-500 transition-all p-0.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-white transition"
                title="Upload image"
              >
                <Upload className="size-3.5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />

              <input
                className="flex-1 bg-transparent px-1.5 text-xs outline-none text-white placeholder:text-slate-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe design (e.g. Luxury real estate flyer)..."
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />

              <button
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition disabled:opacity-40 font-medium"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Canvas & Video Preview Panel */}
        <div className="flex-1 flex flex-col p-4 bg-[#090b10] relative overflow-y-auto">
          {/* Top Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={undo}
                disabled={activeVersion === 0 || versions.length === 0}
                className="px-2.5 py-1 bg-slate-800 rounded text-xs font-medium disabled:opacity-30 hover:bg-slate-700 transition"
              >
                Undo
              </button>
              <button
                onClick={redo}
                disabled={activeVersion === versions.length - 1 || versions.length === 0}
                className="px-2.5 py-1 bg-slate-800 rounded text-xs font-medium disabled:opacity-30 hover:bg-slate-700 transition"
              >
                Redo
              </button>
              {versions.length > 0 && (
                <span className="text-[11px] text-slate-500 font-mono ml-1">
                  v{activeVersion + 1}/{versions.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Animate into Video Omni Flash CTA */}
              {versions.length > 0 && (
                <div className="flex items-center gap-1 bg-purple-950/20 border border-purple-500/30 p-0.5 rounded-md">
                  <select
                    value={videoAspect}
                    onChange={(e) => setVideoAspect(e.target.value as any)}
                    className="bg-transparent text-[11px] font-mono text-purple-300 px-1 outline-none cursor-pointer"
                  >
                    <option value="16:9" className="bg-[#0f131a]">16:9</option>
                    <option value="9:16" className="bg-[#0f131a]">9:16</option>
                  </select>
                  <button
                    onClick={animateCurrentDesign}
                    disabled={animatingVideo}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded transition flex items-center gap-1 disabled:opacity-50"
                  >
                    <Video className="size-3" />
                    <span>Animate Video</span>
                  </button>
                </div>
              )}

              {versions.length > 0 && (
                <button
                  onClick={() => downloadMedia(versions[activeVersion], `tros-design-${activeVersion + 1}.png`)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded transition flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Download className="size-3" />
                  Download PNG
                </button>
              )}
            </div>
          </div>

          {/* Visual Display: Image & Generated Video (Compact, High Density) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-[380px]">
            {/* Image Canvas */}
            <div className="bg-[#0c0f16] rounded-lg border border-[#1a202c] p-3 flex flex-col items-center justify-center overflow-hidden relative shadow-inner">
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                  Graphic Canvas
                </span>
                {versions[activeVersion] && (
                  <span className="text-[10px] font-mono font-semibold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.2 rounded">
                    {aspectRatio} · {imageSize}
                  </span>
                )}
              </div>

              {versions.length > 0 && versions[activeVersion] ? (
                <img
                  src={versions[activeVersion]}
                  alt="Active Design"
                  className="max-w-full max-h-[440px] object-contain rounded border border-slate-800 shadow-md"
                />
              ) : (
                <div className="text-center text-slate-500 flex flex-col items-center p-6">
                  <ImageIcon className="size-10 mb-2 opacity-30 text-blue-400" />
                  <p className="font-medium text-xs text-slate-300">No design rendered yet</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                    Upload an image or enter a prompt on the left to synthesize with Nano Banana 2.1.
                  </p>
                </div>
              )}
            </div>

            {/* Omni Flash Video Preview */}
            <div className="bg-[#0c0f16] rounded-lg border border-[#1a202c] p-3 flex flex-col items-center justify-center overflow-hidden relative shadow-inner">
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 px-2 py-0.5 rounded border border-slate-800 text-slate-300 flex items-center gap-1">
                  <Video className="size-3 text-purple-400" /> Omni Flash Motion
                </span>
                {generatedVideoUrl && (
                  <span className="text-[10px] font-mono font-semibold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.2 rounded">
                    720p · {videoAspect}
                  </span>
                )}
              </div>

              {generatedVideoUrl ? (
                <div className="w-full flex flex-col items-center justify-center space-y-2.5">
                  <video
                    key={generatedVideoUrl}
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    muted
                    playsInline
                    loop
                    className="max-w-full max-h-[400px] rounded border border-slate-800 shadow-md"
                  />
                  <button
                    onClick={() => downloadMedia(generatedVideoUrl, 'tros-animated-video.mp4')}
                    className="text-xs font-medium text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer bg-slate-900 hover:bg-slate-800 px-3 py-1 rounded border border-purple-500/30 transition"
                  >
                    <Download className="size-3" /> Download MP4 Video
                  </button>
                </div>
              ) : (
                <div className="text-center text-slate-500 flex flex-col items-center p-6">
                  <Play className="size-10 mb-2 opacity-30 text-purple-400" />
                  <p className="font-medium text-xs text-slate-300">Omni Flash Video Standby</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                    Click &quot;Animate Video&quot; above to generate motion frames directly from your image.
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
