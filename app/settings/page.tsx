'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { AuthGuard } from '@/components/auth-guard'
import { Key, Bot, Shield, CheckCircle2, ChevronRight, Zap } from 'lucide-react'

const aiProviders = [
  { name: 'OpenAI', desc: 'GPT-4 for text generation' },
  { name: 'Gemini', desc: 'Google Gemini Pro integration' },
  { name: 'ElevenLabs', desc: 'Ultra-realistic voice synthesis' },
  { name: 'Midjourney', desc: 'High-quality image generation' },
  { name: 'Replicate', desc: 'Open-source AI models' },
  { name: 'Lovable', desc: 'UI generation' },
]

const socialProviders = [
  { name: 'LinkedIn', desc: 'Professional network posting' },
  { name: 'Twitter / X', desc: 'Thread automation' },
  { name: 'Instagram', desc: 'Visual media and reels' },
  { name: 'TikTok', desc: 'Short-form video' },
]

export default function SettingsPage() {
  const [provider, setProvider] = useState('')
  const [value, setValue] = useState('')
  const [message, setMessage] = useState('')
  
  // Mock connected state
  const [connected, setConnected] = useState<string[]>(['OpenAI'])

  const saveKey = (e: React.FormEvent) => {
    e.preventDefault()
    if (!provider || !value) return
    
    // Simulate save
    setTimeout(() => {
      setConnected(prev => [...prev, provider])
      setMessage(`Successfully connected ${provider}!`)
      setValue('')
      setProvider('')
      setTimeout(() => setMessage(''), 3000)
    }, 1000)
  }

  return (
    <AuthGuard>
      <DashboardShell>
        <div className="flex flex-col h-full w-full max-w-6xl mx-auto px-4 lg:px-8 py-6">
          
          <div className="mb-8">
            <h1 className="text-4xl font-light tracking-tight text-[#1B1E1C]">API <span className="font-medium">Integrations</span></h1>
            <p className="text-gray-500 font-medium mt-2">Connect your AI agents and social media accounts to fully automate your operations.</p>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            
            {/* Left Column: Active Connections */}
            <div className="space-y-8">
              <div className="rounded-[2.5rem] bg-white border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-10 rounded-xl bg-[#EAF79F] flex items-center justify-center">
                    <Bot className="size-5 text-[#1B1E1C]" />
                  </div>
                  <h3 className="text-xl font-semibold">AI Agents & Models</h3>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {aiProviders.map(p => {
                    const isConnected = connected.includes(p.name)
                    return (
                      <div key={p.name} className={`p-5 rounded-2xl border transition-colors ${isConnected ? 'border-[#EAF79F] bg-[#f9fceb]' : 'border-gray-100 bg-[#F4F5F4]'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-900">{p.name}</span>
                          {isConnected ? (
                            <CheckCircle2 className="size-5 text-emerald-500" />
                          ) : (
                            <div className="size-2 rounded-full bg-gray-300 mt-2" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{p.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-[2.5rem] bg-white border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-10 rounded-xl bg-[#1B1E1C] flex items-center justify-center">
                    <Zap className="size-5 text-[#EAF79F]" />
                  </div>
                  <h3 className="text-xl font-semibold">Social Platforms</h3>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {socialProviders.map(p => {
                    const isConnected = connected.includes(p.name)
                    return (
                      <div key={p.name} className={`p-5 rounded-2xl border transition-colors ${isConnected ? 'border-[#EAF79F] bg-[#f9fceb]' : 'border-gray-100 bg-[#F4F5F4]'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-900">{p.name}</span>
                          {isConnected ? (
                            <CheckCircle2 className="size-5 text-emerald-500" />
                          ) : (
                            <div className="size-2 rounded-full bg-gray-300 mt-2" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{p.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Connect New Form */}
            <div>
              <div className="sticky top-6 rounded-[2.5rem] bg-[#1B1E1C] text-white p-8 shadow-xl">
                <h3 className="text-2xl font-light mb-6 tracking-tight">Add <span className="font-medium">Connection</span></h3>
                
                <form onSubmit={saveKey} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Service Provider</label>
                    <select 
                      required
                      value={provider} 
                      onChange={e => setProvider(e.target.value)} 
                      className="w-full h-12 bg-white/10 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-[#EAF79F] transition appearance-none"
                    >
                      <option value="" className="text-black">Select a provider...</option>
                      <optgroup label="AI Agents" className="text-black">
                        {aiProviders.map(p => <option key={p.name} value={p.name} className="text-black">{p.name}</option>)}
                      </optgroup>
                      <optgroup label="Social Platforms" className="text-black">
                        {socialProviders.map(p => <option key={p.name} value={p.name} className="text-black">{p.name}</option>)}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">API Key or Token</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <input 
                        required
                        type="password" 
                        value={value} 
                        onChange={e => setValue(e.target.value)} 
                        placeholder="sk-..."
                        className="w-full h-12 bg-white/10 border border-white/10 rounded-xl pl-11 pr-4 text-white outline-none focus:border-[#EAF79F] transition placeholder:text-gray-500 font-mono"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full h-12 mt-4 bg-[#EAF79F] hover:bg-white text-black font-bold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    Connect Service <ChevronRight className="size-4" />
                  </button>

                  {message && (
                    <div className="mt-4 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-sm font-medium text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="size-4" /> {message}
                    </div>
                  )}
                </form>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-start gap-3 text-sm text-gray-400">
                    <Shield className="size-5 text-[#EAF79F] shrink-0" />
                    <p>Your API keys are encrypted at rest using AES-256 and never exposed to the client side.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </DashboardShell>
    </AuthGuard>
  )
}
