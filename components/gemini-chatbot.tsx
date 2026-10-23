'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Check,
  ChevronDown,
  Copy,
  Globe,
  Loader2,
  Maximize2,
  MessageSquare,
  Minimize2,
  RotateCcw,
  Send,
  Sparkles,
  Terminal,
  User,
  X,
  Zap,
} from 'lucide-react'

interface Message {
  role: 'user' | 'model'
  content: string
  timestamp?: string
}

const ROLES = [
  {
    id: 'web_architect',
    label: 'Full-Stack Web Architect',
    description: 'Next.js, Tailwind, component blueprints, and web scaffolds',
    systemInstruction:
      'You are the Lead Full-Stack Web Architect for Reality Operations System (TROS). Provide production-ready, accessible, modular HTML5/React/Tailwind architectural advice, responsive layout best practices, and code snippets.',
  },
  {
    id: 'devops_engineer',
    label: 'DevOps & Domain Engineer',
    description: 'DNS routing, A/CNAME records, SSL, and GitHub CI/CD',
    systemInstruction:
      'You are the Senior DevOps & Infrastructure Engineer for Reality Operations System (TROS). Advise on DNS record configuration (A records to 76.76.21.21, CNAME to edge), SSL provisioning, GitHub repository synchronization, and edge deployments.',
  },
  {
    id: 'business_strategist',
    label: 'Executive Strategist',
    description: 'Pricing, agency retainers, and high-converting client funnels',
    systemInstruction:
      'You are the Executive Business Strategist for Reality Operations System (TROS). Provide actionable advice on closing web design clients, pricing landing page projects ($3k-$10k), and building automated client management retainers.',
  },
  {
    id: 'design_director',
    label: 'Creative Design Director',
    description: '8-point grid, typography hierarchy, and visual aesthetics',
    systemInstruction:
      'You are the Creative Design Director for Reality Operations System (TROS). Critique visual aesthetics, recommend font pairings, enforce zero-pill discipline, and maintain dark agency polish.',
  },
]

export function GeminiChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedRole, setSelectedRole] = useState(ROLES[0])
  const [modelTier, setModelTier] = useState<'argon' | 'flash' | 'lite'>('flash')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content:
        'Hello! I am your TROS Gemini Copilot. Select an executive role (Web Architect, DevOps Engineer, Strategist, or Design Director) and choose your preferred model tier (Argon for complex tasks, Flash for general tasks, or Lite for fast responses). How can I assist your operations today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || loading) return

    const userText = input.trim()
    setInput('')

    const updatedHistory: Message[] = [
      ...messages,
      {
        role: 'user',
        content: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]

    setMessages(updatedHistory)
    setLoading(true)

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({ role: m.role, content: m.content })),
          modelTier,
          systemInstruction: selectedRole.systemInstruction,
        }),
      })

      const data = await res.json()
      if (res.ok && data.text) {
        setMessages([
          ...updatedHistory,
          {
            role: 'model',
            content: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      } else {
        setMessages([
          ...updatedHistory,
          {
            role: 'model',
            content: `Error: ${data.error || 'Failed to generate response.'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      }
    } catch (err: any) {
      setMessages([
        ...updatedHistory,
        {
          role: 'model',
          content: `Network error: ${err.message || 'Unable to communicate with Gemini.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const quickPrompts = [
    'How do I configure DNS A and CNAME records for my custom domain?',
    'Explain the workflow for importing and exporting to GitHub in TROS.',
    'Give me a high-converting agency website blueprint structure.',
  ]

  return (
    <>
      {/* Floating Trigger Button in Bottom-Right */}
      <button
        type="button"
        aria-label="Open Gemini AI Copilot"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-40 size-13 sm:size-14 rounded-2xl bg-[#eaf79f] text-black shadow-2xl flex items-center justify-center hover:bg-white transition-all active:scale-95 group border border-black/10"
      >
        {isOpen ? (
          <X className="size-6 text-black" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Bot className="size-6 text-black group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </button>

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Gemini Conversational Chatbot"
          className={`fixed z-50 bg-[#121413] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out ${
            isExpanded
              ? 'inset-3 sm:inset-6'
              : 'bottom-20 right-4 sm:right-6 w-[94vw] sm:w-[460px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-white/10 bg-[#161817] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  Gemini Copilot
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {modelTier === 'argon' ? '4-Argon' : modelTier === 'flash' ? '3.8-Flash' : '3.1-Lite'}
                  </span>
                </h3>
                <p className="text-[10px] text-white/50">{selectedRole.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition hidden sm:inline-flex"
                title={isExpanded ? 'Minimize' : 'Maximize'}
              >
                {isExpanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Model & Role Controls Bar */}
          <div className="px-3 py-2 bg-[#0d0f0e] border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Role Selector */}
            <select
              value={selectedRole.id}
              onChange={(e) => {
                const found = ROLES.find((r) => r.id === e.target.value)
                if (found) setSelectedRole(found)
              }}
              className="px-2.5 py-1 rounded-xl bg-[#181b19] border border-white/10 text-[11px] text-white font-medium outline-none max-w-[210px] truncate"
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  Role: {r.label}
                </option>
              ))}
            </select>

            {/* Model Tier Selector */}
            <div className="flex items-center bg-black/40 rounded-xl p-0.5 border border-white/10 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setModelTier('argon')}
                className={`px-2 py-1 rounded-lg transition ${
                  modelTier === 'argon' ? 'bg-purple-600 text-white' : 'text-white/50 hover:text-white'
                }`}
                title="gemini-4-argon for complex tasks"
              >
                Argon
              </button>
              <button
                type="button"
                onClick={() => setModelTier('flash')}
                className={`px-2 py-1 rounded-lg transition ${
                  modelTier === 'flash' ? 'bg-[#eaf79f] text-black' : 'text-white/50 hover:text-white'
                }`}
                title="gemini-3.8-flash for general tasks"
              >
                Flash
              </button>
              <button
                type="button"
                onClick={() => setModelTier('lite')}
                className={`px-2 py-1 rounded-lg transition ${
                  modelTier === 'lite' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                }`}
                title="gemini-3.1-flash-lite for fast tasks"
              >
                Lite
              </button>
            </div>
          </div>

          {/* Scrollable Message Thread */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user'
              return (
                <div
                  key={index}
                  className={`flex flex-col space-y-1 ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40 px-1">
                    <span>{isUser ? 'You' : selectedRole.label}</span>
                    {msg.timestamp && <span>· {msg.timestamp}</span>}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[88%] break-words relative group ${
                      isUser
                        ? 'bg-[#eaf79f] text-black font-medium shadow-sm'
                        : 'bg-[#181a19] text-white/90 border border-white/10 whitespace-pre-wrap'
                    }`}
                  >
                    {msg.content}

                    {!isUser && (
                      <button
                        onClick={() => handleCopyMessage(msg.content, index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1 rounded bg-black/50 text-white/70 hover:text-white"
                        title="Copy message"
                      >
                        {copiedIndex === index ? (
                          <Check className="size-3 text-emerald-400" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#181a19] border border-white/10 text-xs text-purple-300 max-w-[70%]">
                <Loader2 className="size-3.5 animate-spin text-purple-400 shrink-0" />
                <span>
                  Gemini ({modelTier === 'argon' ? 'gemini-4-argon' : modelTier === 'flash' ? 'gemini-3.8-flash' : 'gemini-3.1-flash-lite'}) is reasoning...
                </span>
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          {messages.length <= 2 && (
            <div className="px-3 py-1.5 border-t border-white/5 bg-[#0e100f] flex flex-wrap gap-1.5">
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(q)
                    setTimeout(() => inputRef.current?.focus(), 50)
                  }}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-white/60 hover:text-white transition truncate max-w-full text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Message Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-[#161817] border-t border-white/10">
            <div className="relative flex items-end bg-[#0a0c0b] border border-white/10 rounded-2xl focus-within:border-purple-400 transition pr-2">
              <textarea
                ref={inputRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${selectedRole.label}... (Enter to send, Shift+Enter for newline)`}
                className="w-full bg-transparent p-3 text-xs text-white placeholder:text-white/30 outline-none resize-none leading-relaxed"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="mb-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition disabled:opacity-40"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
