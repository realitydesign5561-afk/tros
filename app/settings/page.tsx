'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/dashboard-shell'
import { AuthGuard } from '@/components/auth-guard'
import {
  Key,
  Bot,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Zap,
  Globe,
  Radio,
  Lock,
  ChevronRight,
  ArrowRight,
  Wrench,
  Cpu,
  Share2,
} from 'lucide-react'

interface McpStatus {
  connected: boolean
  status: 'CONNECTED' | 'DISCONNECTED' | 'REQUIRES_AUTH' | 'ERROR'
  serverUrl: string
  toolsCount?: number
  tools?: string[]
  error?: string
  lastVerified?: string
}

const aiProviders = [
  { name: 'Gemini', desc: 'Google Gemini Pro / Flash AI models' },
  { name: 'OpenAI', desc: 'GPT-4o text & multimodal generation' },
  { name: 'ElevenLabs', desc: 'Voice synthesis and audio cloning' },
  { name: 'Replicate', desc: 'Open-source vision and diffusion models' },
]

const socialPlatforms = [
  { id: 'twitter', name: 'Twitter / X', desc: 'Tweets, thread dispatch, scheduled posts' },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Professional updates & founder articles' },
  { id: 'instagram', name: 'Instagram', desc: 'Reels, captions, visual feed automation' },
  { id: 'facebook', name: 'Facebook', desc: 'Page updates & audience broadcast' },
  { id: 'tiktok', name: 'TikTok', desc: 'Short video caption generation & sync' },
  { id: 'threads', name: 'Threads', desc: 'Microblogging posts and discussions' },
]

export default function SettingsPage() {
  // Activepieces MCP State
  const [mcpStatus, setMcpStatus] = useState<McpStatus | null>(null)
  const [mcpLoading, setMcpLoading] = useState(false)
  const [mcpNotice, setMcpNotice] = useState<string | null>(null)
  const [manualToken, setManualToken] = useState('')
  const [showManualMcp, setShowManualMcp] = useState(false)

  // Social Sessions State
  const [socialSessions, setSocialSessions] = useState<Record<string, any>>({})
  const [socialLoading, setSocialLoading] = useState(true)

  // AI Providers State
  const [aiConnected, setAiConnected] = useState<string[]>([])
  const [selectedProvider, setSelectedProvider] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [aiMessage, setAiMessage] = useState('')
  const [aiSubmitting, setAiSubmitting] = useState(false)

  // Fetch MCP status
  const loadMcpStatus = useCallback(async () => {
    setMcpLoading(true)
    try {
      const res = await fetch('/api/activepieces/connection')
      if (res.ok) {
        const data = await res.json()
        setMcpStatus(data)
      }
    } catch {
      setMcpStatus({
        connected: false,
        status: 'ERROR',
        serverUrl: 'https://cloud.activepieces.com/mcp/platform',
        error: 'Unable to query MCP connection endpoint.',
      })
    } finally {
      setMcpLoading(false)
    }
  }, [])

  // Fetch Social sessions
  const loadSocialSessions = useCallback(async () => {
    setSocialLoading(true)
    try {
      const res = await fetch('/api/social/sessions')
      if (res.ok) {
        const data = await res.json()
        const map: Record<string, any> = {}
        if (Array.isArray(data.sessions)) {
          data.sessions.forEach((s: any) => {
            map[s.platform] = s
          })
        }
        setSocialSessions(map)
      }
    } catch {
      // ignore
    } finally {
      setSocialLoading(false)
    }
  }, [])

  // Fetch AI settings
  const loadAiSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.connected)) {
          setAiConnected(data.connected)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    loadMcpStatus()
    loadSocialSessions()
    loadAiSettings()
  }, [loadMcpStatus, loadSocialSessions, loadAiSettings])

  // Connect Activepieces via OAuth popup
  const connectActivepiecesOAuth = () => {
    const width = 600
    const height = 720
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      '/api/activepieces/oauth/start',
      'ActivepiecesOAuth',
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no`
    )

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ACTIVEPIECES_AUTH_SUCCESS') {
        window.removeEventListener('message', handleMessage)
        setMcpNotice('Activepieces OAuth authorization successful! Verified MCP tools connected.')
        loadMcpStatus()
      } else if (event.data?.type === 'ACTIVEPIECES_AUTH_ERROR') {
        window.removeEventListener('message', handleMessage)
        setMcpNotice(`Authorization failed: ${event.data.error || 'Unknown error'}`)
      }
    }

    window.addEventListener('message', handleMessage)
  }

  // Disconnect Activepieces
  const disconnectActivepieces = async () => {
    if (!confirm('Are you sure you want to disconnect Activepieces MCP?')) return
    try {
      const res = await fetch('/api/activepieces/connection', { method: 'DELETE' })
      if (res.ok) {
        setMcpNotice('Activepieces MCP connection cleared.')
        await loadMcpStatus()
      }
    } catch {
      setMcpNotice('Failed to disconnect.')
    }
  }

  // Save manual MCP access token fallback
  const handleSaveManualMcp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualToken.trim()) return

    try {
      const res = await fetch('/api/activepieces/connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: manualToken.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setMcpNotice('MCP token saved and connection verified!')
        setManualToken('')
        setShowManualMcp(false)
        await loadMcpStatus()
      } else {
        setMcpNotice(data.error || 'Failed to verify MCP token.')
      }
    } catch {
      setMcpNotice('Network error saving MCP token.')
    }
  }

  // Save AI API Key
  const handleSaveAiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProvider || !apiKeyInput) return

    setAiSubmitting(true)
    setAiMessage('')

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider, value: apiKeyInput }),
      })

      if (response.ok) {
        setAiConnected((prev) => Array.from(new Set([...prev, selectedProvider])))
        setAiMessage(`Successfully saved ${selectedProvider} API key!`)
        setApiKeyInput('')
        setSelectedProvider('')
      } else {
        const data = await response.json()
        setAiMessage(data.error || `Failed to save ${selectedProvider}. Please try again.`)
      }
    } catch {
      setAiMessage('An error occurred while saving the key.')
    } finally {
      setAiSubmitting(false)
      setTimeout(() => setAiMessage(''), 4000)
    }
  }

  return (
    <AuthGuard>
      <DashboardShell>
        <div className="flex flex-col h-full w-full max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-8">
          
          {/* Header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Integrations & Services
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Platform Integrations & Connections
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-3xl">
              Configure Activepieces Model Context Protocol (MCP), manual social account logins, and AI service providers.
            </p>
          </div>

          {/* ACTIVEPIECES REMOTE MCP SECTION */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Radio className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">Activepieces MCP Integration</h2>
                    <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[11px] font-semibold">
                      Model Context Protocol
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Remote MCP server: <code className="font-mono text-foreground font-semibold">https://cloud.activepieces.com/mcp/platform</code>
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                {mcpLoading ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    <RefreshCw className="size-3 animate-spin" /> Checking MCP...
                  </span>
                ) : mcpStatus?.connected ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    MCP Connected ({mcpStatus.toolsCount ?? 0} tools)
                  </div>
                ) : mcpStatus?.status === 'REQUIRES_AUTH' ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-600">
                    <AlertCircle className="size-3.5" /> Session Expired
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3.5 py-1 text-xs font-semibold text-muted-foreground">
                    <span className="size-2 rounded-full bg-muted-foreground" /> Disconnected
                  </div>
                )}
                <button
                  onClick={loadMcpStatus}
                  title="Refresh connection status"
                  className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition"
                >
                  <RefreshCw className={`size-4 ${mcpLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* MCP Notice */}
            {mcpNotice && (
              <div className="mt-4 p-3 rounded-xl border border-primary/30 bg-primary/5 text-sm text-foreground flex items-center justify-between">
                <span>{mcpNotice}</span>
                <button onClick={() => setMcpNotice(null)} className="text-xs text-muted-foreground hover:underline ml-4">
                  Dismiss
                </button>
              </div>
            )}

            {/* MCP Body */}
            <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Activepieces provides an official remote MCP server that exposes hundreds of enterprise actions (Slack, Google Sheets, Notion, Webhooks, CRM sync) directly to your TROS AI agents and visual workflows. Authenticate once via OAuth 2.0 PKCE to enable live tool discovery.
                </p>

                {/* Status description */}
                {mcpStatus?.connected ? (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                      <CheckCircle2 className="size-4" /> Live MCP Handshake Verified
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Authenticated over Streamable HTTP transport. AI agents have access to {mcpStatus.toolsCount ?? 0} Activepieces tools.
                    </p>
                    {mcpStatus.tools && mcpStatus.tools.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Discovered MCP Tools:
                        </p>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {mcpStatus.tools.map((tool) => (
                            <span
                              key={tool}
                              className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-mono text-foreground"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Radio className="size-4 text-amber-500" /> Remote MCP Endpoint Ready
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click below to connect your Activepieces workspace using the OAuth flow. Tokens are exchanged server-side and automatically refreshed.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Column */}
              <div className="rounded-2xl border border-border bg-muted/10 p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">MCP Connection Actions</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Authenticate via OAuth 2.0 PKCE with Activepieces cloud.
                  </p>

                  <div className="space-y-2">
                    {!mcpStatus?.connected ? (
                      <button
                        type="button"
                        onClick={connectActivepiecesOAuth}
                        className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-95 transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Zap className="size-4" /> Connect Activepieces (OAuth)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={disconnectActivepieces}
                        className="w-full h-10 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition flex items-center justify-center gap-2"
                      >
                        Disconnect MCP
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowManualMcp(!showManualMcp)}
                      className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-1 transition"
                    >
                      {showManualMcp ? 'Hide manual token' : 'Have a manual bearer token?'}
                    </button>
                  </div>

                  {showManualMcp && (
                    <form onSubmit={handleSaveManualMcp} className="mt-3 space-y-2 pt-2 border-t border-border">
                      <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Manual Access Token
                      </label>
                      <input
                        type="password"
                        placeholder="ap_tok_..."
                        value={manualToken}
                        onChange={(e) => setManualToken(e.target.value)}
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-mono outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        className="w-full h-8 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition"
                      >
                        Save Token
                      </button>
                    </form>
                  )}
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Shield className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Tokens are stored encrypted at rest with AES-256.</span>
                </div>
              </div>
            </div>
          </div>

          {/* SOCIAL MEDIA DIRECT LOGIN SECTION */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <Share2 className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">Social Media Accounts (Direct Login)</h2>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold">
                      No API Keys Required
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Direct account authentication for Twitter/X, LinkedIn, Instagram, Facebook, TikTok, and Threads.
                  </p>
                </div>
              </div>

              <Link
                href="/social/connections"
                className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-2 text-sm font-semibold hover:opacity-90 transition shrink-0"
              >
                Manage Social Accounts <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-6">
              <div className="mb-4 flex items-start gap-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4">
                <Lock className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Manual Credential Guarantee:</strong> You do not need to register developer apps or pay for platform API tiers. Enter your username/email and password directly in the Connections Manager. All credentials are encrypted with AES-256 at rest and used securely by your autonomous social publisher.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {socialPlatforms.map((platform) => {
                  const session = socialSessions[platform.id]
                  const isConnected = session?.status === 'CONNECTED'
                  return (
                    <div
                      key={platform.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isConnected
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-border bg-muted/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{platform.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{platform.desc}</p>
                        </div>
                        {isConnected ? (
                          <div className="flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                            <CheckCircle2 className="size-4" />
                          </div>
                        ) : (
                          <div className="size-2 rounded-full bg-muted-foreground/40 mt-1.5" />
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">
                          {isConnected ? session?.accountName || 'Active' : 'Not configured'}
                        </span>
                        <Link
                          href="/social/connections"
                          className="text-primary hover:underline font-medium"
                        >
                          {isConnected ? 'Edit' : 'Connect'}
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* AI MODELS & PROVIDERS SECTION */}
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                  <Bot className="size-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">AI Models & Speech Engines</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Connect Gemini, OpenAI, and multimedia APIs for autonomous course and content creation.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {aiProviders.map((p) => {
                  const isConnected = aiConnected.includes(p.name)
                  return (
                    <div
                      key={p.name}
                      className={`p-4 rounded-2xl border transition-all ${
                        isConnected
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-border bg-muted/20'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-semibold text-sm text-foreground">{p.name}</span>
                        {isConnected ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                            <CheckCircle2 className="size-3.5" /> Ready
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Optional</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AI Key Form */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Add AI API Key</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Keys are stored encrypted on the server and never sent to clients.
                </p>

                <form onSubmit={handleSaveAiKey} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Provider
                    </label>
                    <select
                      required
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value)}
                      className="w-full h-10 bg-background border border-border rounded-xl px-3 text-sm text-foreground outline-none focus:border-primary transition"
                    >
                      <option value="">Select AI Provider...</option>
                      {aiProviders.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      API Secret Key
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        required
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="sk-..."
                        className="w-full h-10 bg-background border border-border rounded-xl pl-9 pr-3 text-xs font-mono text-foreground outline-none focus:border-primary transition placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={aiSubmitting}
                    className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    {aiSubmitting ? 'Saving...' : 'Save API Key'} <ChevronRight className="size-4" />
                  </button>

                  {aiMessage && (
                    <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-foreground text-center">
                      {aiMessage}
                    </div>
                  )}
                </form>
              </div>

              <div className="pt-4 border-t border-border mt-4 text-[11px] text-muted-foreground flex items-center gap-2">
                <Shield className="size-3.5 text-emerald-500 shrink-0" />
                <span>NextAuth URL configured: <code className="font-mono text-foreground">https://tros-opal.vercel.app/</code></span>
              </div>
            </div>
          </div>

        </div>
      </DashboardShell>
    </AuthGuard>
  )
}
