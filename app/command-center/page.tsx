'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { AuthGuard } from '@/components/auth-guard'
import {
  AlertCircle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  Coins,
  Cpu,
  Globe2,
  Key,
  Layers,
  ListTodo,
  Loader2,
  MapPin,
  MessageSquare,
  Mic,
  MicOff,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react'

interface AgentTaskEvent {
  id: string
  eventType: string
  message: string
  agentName?: string
  createdAt: string
}

interface AgentTaskStep {
  id: string
  title: string
  agentKey: string
  agentName: string
  action: string
  status: 'PENDING' | 'RUNNING' | 'WAITING_APPROVAL' | 'COMPLETED' | 'FAILED' | 'SKIPPED'
  requiresApproval?: boolean
}

interface TaskRecord {
  id: string
  prompt: string
  status: 'QUEUED' | 'RUNNING' | 'WAITING_APPROVAL' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  progress: number
  currentStep?: string
  plan?: string
  output?: string
  estimatedCost: number
  createdAt: string
  completedAt?: string
  events?: AgentTaskEvent[]
}

const EXAMPLE_DIRECTIVES = [
  {
    title: 'AI Web Design Masterclass & Funnel',
    prompt: 'Create a complete beginner course on web design using AI, generate the 12-stage curriculum, lesson scripts, quizzes, capstone brief, and prepare sales page.',
  },
  {
    title: 'Agency Landing Page & Checkout',
    prompt: 'Build a landing page and checkout for my new course with responsive sections, pricing tiers, and enrollment funnel.',
  },
  {
    title: 'Real Estate Leads & Site Proposal',
    prompt: 'Find suitable real estate businesses that need websites, research their current online presence, prepare personalized website concepts, generate proposals, add qualified prospects to my CRM, and prepare outreach for my approval.',
  },
  {
    title: 'Faceless YouTube Content Pipeline',
    prompt: 'Discover an underserved high-CPM niche for a faceless YouTube channel, research competitor videos, draft high-CTR titles, and create a complete 10-minute video script with narration and visual cues.',
  },
  {
    title: 'Weekly Omnichannel Social Blast',
    prompt: 'Plan a 7-day content schedule across Twitter, LinkedIn, and Instagram focusing on AI digital services, generate high-conversion copy, prepare visual assets, and queue for publishing.',
  },
]

export default function CommandCenterPage() {
  const [prompt, setPrompt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ALL' | 'RUNNING' | 'WAITING_APPROVAL' | 'COMPLETED' | 'FAILED'>('ALL')
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null)
  const [taskEvents, setTaskEvents] = useState<AgentTaskEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [actionBusy, setActionBusy] = useState<string | null>(null)

  // Audio recording state for Gemini 3.5 Transcribe
  const [isRecording, setIsRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Keys status modal
  const [showKeysModal, setShowKeysModal] = useState(false)

  // Gemini Copilot Chat Drawer
  const [showChatCopilot, setShowChatCopilot] = useState(false)
  const [chatModelTier, setChatModelTier] = useState<'argon' | 'flash' | 'lite'>('flash')
  const [groundingMode, setGroundingMode] = useState<'none' | 'search' | 'maps'>('none')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([
    {
      role: 'model',
      content:
        'Hello! I am your TROS Executive Copilot powered by Google Gemini. Ask me to reason through complex agency operations (Argon), query live web information (Search Grounding), or look up local business points of interest (Maps Grounding).',
    },
  ])
  const [chatLoading, setChatLoading] = useState(false)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/agent/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 6000)
    return () => clearInterval(interval)
  }, [fetchTasks])

  const handleSubmitDirective = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!prompt.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/agent/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        setPrompt('')
        await fetchTasks()
        if (data.task) setSelectedTask(data.task)
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  const handleSelectTask = async (task: TaskRecord) => {
    setSelectedTask(task)
    setLoadingEvents(true)
    try {
      const res = await fetch(`/api/agent/tasks/${task.id}/events`)
      if (res.ok) {
        const data = await res.json()
        setTaskEvents(data.events || [])
      }
    } catch {
      setTaskEvents([])
    } finally {
      setLoadingEvents(false)
    }
  }

  const handleApproveStep = async (taskId: string, stepId?: string) => {
    setActionBusy('approve')
    try {
      const res = await fetch(`/api/agent/tasks/${taskId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId }),
      })
      if (res.ok) {
        await fetchTasks()
        if (selectedTask) handleSelectTask(selectedTask)
      }
    } catch {
      // ignore
    } finally {
      setActionBusy(null)
    }
  }

  const handleCancelTask = async (taskId: string) => {
    setActionBusy('cancel')
    try {
      const res = await fetch(`/api/agent/tasks/${taskId}/cancel`, {
        method: 'POST',
      })
      if (res.ok) {
        await fetchTasks()
      }
    } catch {
      // ignore
    } finally {
      setActionBusy(null)
    }
  }

  // Audio Recording with gemini-3.5-transcribe
  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioChunksRef.current = []
        const recorder = new MediaRecorder(stream)
        mediaRecorderRef.current = recorder

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data)
        }

        recorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop())
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          const reader = new FileReader()
          reader.onloadend = async () => {
            const base64Audio = reader.result as string
            setTranscribing(true)
            try {
              const res = await fetch('/api/gemini/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  base64Audio,
                  mimeType: 'audio/webm',
                }),
              })
              const data = await res.json()
              if (data.text) {
                setPrompt((prev) => (prev ? `${prev} ${data.text}` : data.text))
              }
            } catch (err) {
              console.error('Transcription failed:', err)
            } finally {
              setTranscribing(false)
            }
          }
          reader.readAsDataURL(audioBlob)
        }

        recorder.start()
        setIsRecording(true)
      } catch (err) {
        alert('Microphone access was denied or is unavailable.')
      }
    }
  }

  // Gemini Copilot Chat
  const sendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!chatInput.trim() || chatLoading) return

    const userText = chatInput.trim()
    setChatInput('')
    setChatMessages((prev) => [...prev, { role: 'user', content: userText }])
    setChatLoading(true)

    try {
      if (groundingMode !== 'none') {
        // Grounded query
        const res = await fetch('/api/gemini/grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userText,
            mode: groundingMode,
          }),
        })
        const data = await res.json()
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content: `[${groundingMode.toUpperCase()} GROUNDED]\n\n${data.text || 'No response.'}`,
          },
        ])
      } else {
        // Multi-turn chat
        const currentHistory = [...chatMessages, { role: 'user', content: userText }]
        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: currentHistory,
            modelTier: chatModelTier,
            systemInstruction:
              'You are the TROS Executive Copilot for Reality Design digital agency. Provide concise, highly actionable architectural, marketing, and business operational advice.',
          }),
        })
        const data = await res.json()
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content: data.text || 'No response.',
          },
        ])
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'model', content: `Error: ${err.message || 'Failed to complete query'}` },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'ALL') return true
    return t.status === activeTab
  })

  return (
    <AuthGuard>
      <DashboardShell>
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-[#eaf79f]/20 text-[#eaf79f] px-2.5 py-1 rounded-full border border-[#eaf79f]/30 flex items-center gap-1.5">
                  <Bot className="size-3.5" /> Autonomous Workforce Active
                </span>
                <span className="text-xs text-white/50">20 Specialized Agents on Standby</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                <Terminal className="size-8 text-[#eaf79f]" /> Central AI Command Center
              </h1>
              <p className="mt-1 text-sm text-white/60 max-w-2xl">
                Describe a complex business operation in plain English. The Executive Orchestrator decomposes your directive, delegates tasks to specialized agents, enforces safety gates, and delivers verified results.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowKeysModal(true)}
                className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition flex items-center gap-1.5"
                title="View required and optional API keys"
              >
                <Key className="size-3.5 text-[#eaf79f]" />
                Remaining Keys Needed
              </button>

              <button
                onClick={() => setShowChatCopilot(!showChatCopilot)}
                className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                title="Toggle Gemini Copilot"
              >
                <MessageSquare className="size-3.5" />
                Gemini Copilot
              </button>

              <button
                onClick={fetchTasks}
                className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition"
                title="Refresh tasks"
              >
                <RefreshCw className="size-4" />
              </button>
            </div>
          </div>

          {/* Natural Language Prompt Input Bar */}
          <div className="rounded-3xl border border-white/10 bg-[#141615] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#eaf79f]/10 via-transparent to-transparent pointer-events-none blur-3xl" />

            <form onSubmit={handleSubmitDirective} className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#eaf79f] flex items-center gap-2">
                  <Sparkles className="size-3.5" /> High-Level Business Directive
                </label>
                <div className="flex items-center gap-2 text-[11px] text-white/50">
                  {transcribing ? (
                    <span className="text-[#eaf79f] flex items-center gap-1 font-semibold">
                      <Loader2 className="size-3 animate-spin" /> Transcribing with gemini-3.5-transcribe...
                    </span>
                  ) : (
                    <span>Multi-agent decomposition enabled</span>
                  )}
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Find suitable real estate businesses that need websites, research their current online presence, prepare personalized website concepts, generate proposals, add qualified prospects to my CRM, and prepare outreach for my approval."
                  className="w-full rounded-2xl border border-white/10 bg-[#0a0c0b] p-4 text-sm sm:text-base text-white placeholder:text-white/30 outline-none focus:border-[#eaf79f] transition resize-none leading-relaxed pr-14"
                />

                {/* Voice Input Mic Button (gemini-3.5-transcribe) */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={transcribing}
                  className={`absolute right-4 bottom-4 p-2.5 rounded-xl transition ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20'
                      : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                  }`}
                  title={isRecording ? 'Stop recording and transcribe' : 'Voice input (Gemini 3.5 Transcribe)'}
                >
                  {isRecording ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3 text-xs text-white/50">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-emerald-400" /> Human-in-the-loop approval required for outreach & payments
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !prompt.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#eaf79f] text-black px-6 py-3 text-sm font-bold hover:bg-white transition disabled:opacity-40 disabled:hover:bg-[#eaf79f] shadow-lg shadow-[#eaf79f]/10"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Orchestrating Agents...
                    </>
                  ) : (
                    <>
                      <Zap className="size-4" /> Execute Directive <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Example Presets */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2.5">
                Quick Preset Directives:
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {EXAMPLE_DIRECTIVES.map((ex) => (
                  <button
                    key={ex.title}
                    type="button"
                    onClick={() => setPrompt(ex.prompt)}
                    className="p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition text-left group"
                  >
                    <p className="text-xs font-bold text-white group-hover:text-[#eaf79f] transition">
                      {ex.title}
                    </p>
                    <p className="text-[11px] text-white/40 truncate mt-1">{ex.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Gemini Copilot Chat Drawer */}
          {showChatCopilot && (
            <div className="bg-[#141615] rounded-3xl border border-purple-500/30 p-6 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Gemini Conversational Copilot</h3>
                    <p className="text-[11px] text-white/50">Multi-turn strategic reasoning and real-time grounding</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Model Tier Selector */}
                  <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/10 text-[11px] font-bold">
                    <button
                      onClick={() => setChatModelTier('argon')}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        chatModelTier === 'argon' ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      gemini-4-argon (Complex)
                    </button>
                    <button
                      onClick={() => setChatModelTier('flash')}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        chatModelTier === 'flash' ? 'bg-[#eaf79f] text-black' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      gemini-3.8-flash (General)
                    </button>
                    <button
                      onClick={() => setChatModelTier('lite')}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        chatModelTier === 'lite' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      gemini-3.1-flash-lite (Fast)
                    </button>
                  </div>

                  {/* Grounding Mode Toggle */}
                  <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/10 text-[11px] font-bold">
                    <button
                      onClick={() => setGroundingMode('none')}
                      className={`px-2 py-1 rounded-lg transition ${
                        groundingMode === 'none' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      Direct
                    </button>
                    <button
                      onClick={() => setGroundingMode('search')}
                      className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                        groundingMode === 'search' ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      <Search className="size-3" /> Search Grounding
                    </button>
                    <button
                      onClick={() => setGroundingMode('maps')}
                      className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                        groundingMode === 'maps' ? 'bg-emerald-600 text-white' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      <MapPin className="size-3" /> Maps Grounding
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Message Scroll */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white ml-auto'
                        : 'bg-black/50 border border-white/10 text-white/90 shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                {chatLoading && (
                  <div className="p-3 rounded-2xl max-w-[80%] bg-black/40 border border-white/10 flex items-center gap-2 text-xs text-white/60">
                    <Loader2 className="size-3.5 animate-spin text-purple-400" />
                    <span>Gemini is generating strategic reasoning...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={sendChatMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Gemini for strategy, code, market analysis, or grounded data..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-purple-400"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Send className="size-3.5" /> Send
                </button>
              </form>
            </div>
          )}

          {/* Operational Task Board & Detailed Execution Inspector */}
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
            {/* Task Board */}
            <div className="rounded-3xl border border-white/10 bg-[#141615] p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <ListTodo className="size-5 text-[#eaf79f]" />
                  <h2 className="text-lg font-bold text-white">Live Task Operations</h2>
                  <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full text-white/70">
                    {tasks.length}
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-[#0a0c0b] p-1 rounded-xl border border-white/5 text-[11px] font-semibold">
                  {(['ALL', 'RUNNING', 'WAITING_APPROVAL', 'COMPLETED', 'FAILED'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        activeTab === tab
                          ? 'bg-white/20 text-white font-bold'
                          : 'text-white/40 hover:text-white'
                      }`}
                    >
                      {tab.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-white/40 text-sm flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin text-[#eaf79f]" /> Loading tasks...
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="p-12 text-center text-white/40 text-sm">
                  No tasks matching &quot;{activeTab}&quot;. Enter a directive above to orchestrate your workforce.
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {filteredTasks.map((task) => {
                    const isSelected = selectedTask?.id === task.id
                    return (
                      <div
                        key={task.id}
                        onClick={() => handleSelectTask(task)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-3 ${
                          isSelected
                            ? 'border-[#eaf79f] bg-white/[0.06] shadow-lg'
                            : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-white line-clamp-2 leading-relaxed">
                            {task.prompt}
                          </p>
                          <span
                            className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                              task.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : task.status === 'RUNNING'
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                : task.status === 'WAITING_APPROVAL'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : task.status === 'FAILED'
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-white/10 text-white/60 border-white/10'
                            }`}
                          >
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-white/40">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {new Date(task.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span>Progress: {task.progress}%</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {task.status === 'WAITING_APPROVAL' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleApproveStep(task.id)
                                }}
                                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition shadow-sm"
                              >
                                Approve Next Action
                              </button>
                            )}

                            {task.status === 'RUNNING' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCancelTask(task.id)
                                }}
                                className="text-xs text-red-400 hover:text-red-300 px-2 py-0.5 rounded transition"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-[#eaf79f] h-full transition-all duration-500"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Task Detail Inspector */}
            <div className="rounded-3xl border border-white/10 bg-[#141615] p-6 shadow-xl flex flex-col justify-between space-y-6">
              {selectedTask ? (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#eaf79f]">
                        Task Inspector · {selectedTask.id.slice(0, 8)}
                      </span>
                      <span className="text-xs text-white/40">
                        {selectedTask.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white leading-relaxed">
                      {selectedTask.prompt}
                    </h3>
                  </div>

                  {/* Decomposed Plan Steps */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                      <Layers className="size-3.5 text-[#eaf79f]" /> Multi-Agent Execution Plan
                    </p>
                    {selectedTask.plan ? (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {(() => {
                          try {
                            const parsed = JSON.parse(selectedTask.plan)
                            const steps: AgentTaskStep[] = parsed.steps || []
                            return steps.map((s, idx) => (
                              <div
                                key={s.id || idx}
                                className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start justify-between gap-3 text-xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">
                                      {idx + 1}. {s.title}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-white/50">
                                    Assigned to: <strong className="text-white/80">{s.agentName}</strong>
                                  </p>
                                </div>
                                <span
                                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                    s.status === 'COMPLETED'
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : s.status === 'RUNNING'
                                      ? 'bg-blue-500/20 text-blue-400'
                                      : s.status === 'WAITING_APPROVAL'
                                      ? 'bg-amber-500/20 text-amber-400'
                                      : 'bg-white/10 text-white/50'
                                  }`}
                                >
                                  {s.status}
                                </span>
                              </div>
                            ))
                          } catch {
                            return <p className="text-xs text-white/60">{selectedTask.plan}</p>
                          }
                        })()}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/40">
                        Synthesizing plan decomposition...
                      </div>
                    )}
                  </div>

                  {/* Actionable Output Deliverables */}
                  {selectedTask.output && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1b1f1c] to-[#141615] border border-[#eaf79f]/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#eaf79f] flex items-center gap-1.5">
                          <Sparkles className="size-3.5" /> Generated Output Deliverables
                        </span>
                        <span className="text-[10px] text-white/50">Ready to Ship</span>
                      </div>
                      {(() => {
                        try {
                          const out = JSON.parse(selectedTask.output)
                          return (
                            <div className="space-y-2 text-xs">
                              {out.title && <p className="font-bold text-white text-sm">{out.title}</p>}
                              <div className="flex flex-wrap gap-2 pt-1">
                                {out.studioUrl && (
                                  <a
                                    href={out.studioUrl}
                                    className="px-3 py-1.5 rounded-xl bg-[#eaf79f] text-black font-bold hover:bg-white transition flex items-center gap-1 shadow-sm"
                                  >
                                    <Layers className="size-3.5" /> Open Studio
                                  </a>
                                )}
                                {out.learnUrl && (
                                  <a
                                    href={out.learnUrl}
                                    className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition flex items-center gap-1 shadow-sm"
                                  >
                                    <Play className="size-3.5 fill-current" /> Learner Player
                                  </a>
                                )}
                                {out.landingUrl && (
                                  <a
                                    href={out.landingUrl}
                                    className="px-3 py-1.5 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition flex items-center gap-1"
                                  >
                                    <Globe2 className="size-3.5" /> Sales Page
                                  </a>
                                )}
                              </div>
                            </div>
                          )
                        } catch {
                          return <p className="text-xs text-white/70">{selectedTask.output}</p>
                        }
                      })()}
                    </div>
                  )}

                  {/* Live Audit Event Stream */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                      Audit Log & Event Stream
                    </p>
                    {loadingEvents ? (
                      <div className="p-4 text-center text-xs text-white/40">Loading events...</div>
                    ) : taskEvents.length === 0 ? (
                      <div className="p-4 text-center rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/40 font-mono">
                        No audit events recorded yet.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto font-mono text-[11px] pr-1">
                        {taskEvents.map((evt) => (
                          <div
                            key={evt.id}
                            className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-0.5"
                          >
                            <div className="flex items-center justify-between text-[10px] text-white/40">
                              <span className="text-[#eaf79f] font-bold">[{evt.agentName || 'SYSTEM'}]</span>
                              <span>{new Date(evt.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-white/80">{evt.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-white/40 text-sm flex flex-col items-center justify-center h-full">
                  <Terminal className="size-8 mb-3 text-white/20" />
                  Select a task from the board to inspect its execution roadmap, agent logs, and operational controls.
                </div>
              )}

              <div className="pt-4 border-t border-white/10 text-[11px] text-white/40 flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
                <span>All agent subtasks execute under strict least-privilege role boundaries.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Remaining Keys Needed Modal */}
        {showKeysModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#141615] rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-white/15 text-white shadow-2xl relative space-y-6">
              <button
                onClick={() => setShowKeysModal(false)}
                className="absolute top-5 right-5 text-white/40 hover:text-white"
              >
                ✕
              </button>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#eaf79f]">
                  Credential & Infrastructure Audit
                </span>
                <h3 className="text-2xl font-bold mt-1">Remaining Keys & Configuration Needed</h3>
                <p className="text-xs text-white/60 mt-1">
                  Honest overview of configured services, optional third-party integrations, and confirmed no-key manual workflows.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {/* Social Media Manual Login - NO API NEEDED */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-300 text-sm">Social Media (No API Connection Needed)</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">100% Ready</span>
                    </div>
                    <p className="text-white/70 leading-relaxed">
                      As requested, all social platforms (Twitter/X, Instagram, LinkedIn, Facebook, TikTok, Threads) operate via <strong>Manual Account Login</strong>. You never need third-party developer accounts, OAuth approval, or API keys.
                    </p>
                  </div>
                </div>

                {/* GEMINI_API_KEY */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <Key className="size-5 text-[#eaf79f] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">GEMINI_API_KEY</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">Server-Side Secret</span>
                    </div>
                    <p className="text-white/70 leading-relaxed">
                      Powers Gemini 3.8 Flash, 4 Argon, 3.5 Transcribe, Nano Banana 2.1 (Image Create & Edit), and Omni Flash (Video Generation & Animation). Set in environment secrets.
                    </p>
                  </div>
                </div>

                {/* Neon PostgreSQL */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">DATABASE_URL (Neon PostgreSQL)</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Connected</span>
                    </div>
                    <p className="text-white/70 leading-relaxed">
                      Prisma ORM connected to Neon PostgreSQL for persistent agent tasks, clients, assets, and audit events.
                    </p>
                  </div>
                </div>

                {/* Optional 3P Providers */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <Cpu className="size-5 text-sky-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Optional Third-Party Keys</span>
                      <span className="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded-full font-bold">Optional</span>
                    </div>
                    <p className="text-white/60 leading-relaxed">
                      • <strong>OPENAI_API_KEY</strong> (optional fallback for AI Gateway)<br />
                      • <strong>RESEND_API_KEY</strong> (optional for client transactional emails)<br />
                      • <strong>STRIPE_SECRET_KEY</strong> (optional for paid client invoicing)<br />
                      • <strong>ACTIVEPIECES_MCP_URL</strong> (optional for remote tool platform)
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowKeysModal(false)}
                  className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#eaf79f] transition"
                >
                  Close Summary
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardShell>
    </AuthGuard>
  )
}
