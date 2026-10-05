'use client'

import { useState } from 'react'
import { Sparkles, ArrowRight, Loader2, ImagePlus, Send, MessageSquare } from 'lucide-react'

export function SocialOS() {
  const [prompt, setPrompt] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [result, setResult] = useState<{ caption: string, image: string, platforms: string[] } | null>(null)

  const generateContent = () => {
    if (!prompt.trim()) return
    setState('loading')
    
    // Simulate AI generation
    setTimeout(() => {
      setResult({
        caption: "✨ Building a community isn't just about numbers—it's about connection! Whether you're growing your brand or launching a new product, authentic engagement is the key to converting followers into loyal customers. What's the biggest challenge you face when trying to engage your audience? Let's discuss below! 👇\n\n#CommunityBuilding #Engagement #GrowthStrategy",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
        platforms: ['Instagram', 'LinkedIn', 'Twitter']
      })
      setState('done')
    }, 2000)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full max-w-6xl mx-auto px-4 lg:px-8 py-6">
      
      {state === 'idle' && (
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="w-full max-w-4xl space-y-10">
            <div className="text-center space-y-4">
              <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-[#1B1E1C]">
                Grow your <br/><span className="font-medium">community & sales.</span>
              </h1>
              <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">
                Prompt the AI to create engaging social content, generate stunning visuals, and drive conversions across all platforms.
              </p>
            </div>

            <div className="relative group">
              <div className="relative flex w-full flex-col rounded-[2rem] border-2 border-gray-100 bg-[#F4F5F4] shadow-sm transition-all focus-within:border-[#1B1E1C] focus-within:bg-white">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateContent() } }}
                  placeholder="e.g. Create content that builds community that can buy what I sell and also engage..."
                  className="min-h-[160px] w-full resize-none rounded-[2rem] bg-transparent px-8 py-6 text-lg font-medium outline-none placeholder:text-gray-400 text-black"
                />
                
                <div className="flex items-center justify-between px-6 pb-6">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 px-2">
                    <MessageSquare className="size-4" />
                    <span>Multi-platform</span>
                    <ImagePlus className="size-4 ml-4" />
                    <span>Visual Generation</span>
                  </div>
                  
                  <button
                    onClick={generateContent}
                    disabled={!prompt.trim()}
                    className="flex size-14 items-center justify-center rounded-full bg-[#1B1E1C] text-white transition-all hover:bg-black disabled:opacity-50 hover:shadow-lg"
                  >
                    <Send className="size-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {["Product Launch Announcement", "Community Question", "Behind the Scenes", "Customer Success Story"].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(`Generate a ${suggestion.toLowerCase()} post to build community and drive engagement.`)}
                  className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-500 transition hover:bg-[#F4F5F4] hover:text-black shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {state === 'loading' && (
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className="rounded-2xl bg-[#EAF79F] p-5 text-[#1B1E1C] mb-8 shadow-sm animate-pulse">
            <Sparkles className="size-10" />
          </div>
          <h2 className="text-4xl font-light tracking-tight mb-4">Crafting your <span className="font-medium">content...</span></h2>
          <p className="text-gray-500 font-medium">The AI is analyzing trends, generating imagery, and writing engaging copy.</p>
        </div>
      )}

      {state === 'done' && result && (
        <div className="flex-1 flex flex-col h-full bg-[#F4F5F4] rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 shadow-sm relative overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold tracking-tight">Review Generated Content</h2>
            <div className="flex gap-3">
              <button onClick={() => { setState('idle'); setPrompt(''); setResult(null) }} className="px-5 py-2.5 rounded-full font-bold text-sm bg-white border border-gray-200 text-gray-600 hover:text-black transition shadow-sm">Discard</button>
              <button className="px-6 py-2.5 rounded-full font-bold text-sm bg-[#1B1E1C] text-white hover:bg-black transition shadow-lg flex items-center gap-2">
                Schedule to Platforms <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Visuals */}
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-gray-500 uppercase tracking-widest text-xs">Generated Visual</h3>
              <div className="rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-white aspect-square w-full relative">
                <img src={result.image} alt="Generated Visual" className="w-full h-full object-cover" />
                <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:bg-white transition flex items-center gap-2">
                  <ImagePlus className="size-4" /> Regenerate Image
                </button>
              </div>
            </div>

            {/* Copy & Platforms */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-gray-500 uppercase tracking-widest text-xs">Caption & Copy</h3>
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative">
                  <textarea 
                    className="w-full h-64 resize-none bg-transparent outline-none text-lg leading-relaxed font-medium text-gray-800"
                    defaultValue={result.caption}
                  />
                  <div className="absolute top-6 right-6">
                    <button className="size-10 bg-[#F4F5F4] rounded-full flex items-center justify-center text-gray-500 hover:text-black transition" title="Rewrite with AI">
                      <Sparkles className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-gray-500 uppercase tracking-widest text-xs">Target Platforms</h3>
                <div className="flex flex-wrap gap-3">
                  {result.platforms.map(p => (
                    <div key={p} className="px-5 py-2.5 rounded-full bg-[#EAF79F] text-[#1B1E1C] font-bold text-sm shadow-sm flex items-center gap-2">
                      <div className="size-2 rounded-full bg-[#1B1E1C]" /> {p}
                    </div>
                  ))}
                  <button className="px-5 py-2.5 rounded-full border-2 border-dashed border-gray-300 text-gray-500 font-bold text-sm hover:border-gray-400 hover:text-black transition">
                    + Add Platform
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
