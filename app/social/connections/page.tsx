'use client'

import { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Lock,
  User,
  Key,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react'

interface SocialPlatformConfig {
  id: string
  name: string
  tagline: string
  color: string
}

const PLATFORMS: SocialPlatformConfig[] = [
  { id: 'twitter', name: 'Twitter / X', tagline: 'Post tweets, threads, and automated content', color: 'bg-black text-white' },
  { id: 'linkedin', name: 'LinkedIn', tagline: 'Professional posts, articles, and founder updates', color: 'bg-[#0077b5] text-white' },
  { id: 'instagram', name: 'Instagram', tagline: 'Visual feed captions, hashtags, and stories', color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white' },
  { id: 'facebook', name: 'Facebook', tagline: 'Business page updates and community engagement', color: 'bg-[#1877f2] text-white' },
  { id: 'tiktok', name: 'TikTok', tagline: 'Short-form video captions and sound tags', color: 'bg-black text-white' },
  { id: 'threads', name: 'Threads', tagline: 'Microblogging and community conversations', color: 'bg-black text-white' },
]

export default function ConnectionsPage() {
  const [sessions, setSessions] = useState<Record<string, { status: string; accountName?: string; lastCheckedAt?: string }>>({})
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatformConfig | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [accountName, setAccountName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const fetchConnections = async () => {
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
        setSessions(map)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [])

  const handleOpenModal = (platform: SocialPlatformConfig) => {
    setSelectedPlatform(platform)
    const existing = sessions[platform.id]
    setUsername(existing?.accountName || '')
    setPassword('')
    setAccountName(existing?.accountName || '')
    setStatusMessage('')
  }

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlatform || !username.trim()) return

    setIsSubmitting(true)
    setStatusMessage('')

    try {
      const res = await fetch('/api/social/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform.id,
          usernameOrEmail: username.trim(),
          password: password.trim(),
          accountName: accountName.trim() || username.trim(),
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setStatusMessage(`Successfully connected ${selectedPlatform.name}!`)
        await fetchConnections()
        setTimeout(() => {
          setSelectedPlatform(null)
        }, 1000)
      } else {
        setStatusMessage(data.error || 'Failed to save credentials.')
      }
    } catch (err: any) {
      setStatusMessage(err.message || 'Network error.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDisconnect = async (platformId: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platformId}?`)) return
    try {
      const res = await fetch(`/api/social/sessions?platform=${platformId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setSessions((prev) => {
          const next = { ...prev }
          delete next[platformId]
          return next
        })
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Direct Account Access
          </span>
          <span className="text-xs text-gray-500 font-medium">No API developer credentials required</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
          Social Accounts Connection Manager
        </h1>
        <p className="mt-2 text-base text-gray-600 max-w-2xl">
          Connect your social accounts directly by entering your login details. Your credentials are encrypted at rest with AES-256 on the server and used by your AI agents to publish and manage social presence on autopilot.
        </p>
      </div>

      {/* Security Guarantee Banner */}
      <div className="bg-[#1b1e1c] text-white p-5 rounded-2xl flex items-start gap-4 shadow-sm">
        <div className="p-2.5 rounded-xl bg-white/10 text-[#eaf79f]">
          <Lock className="size-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
            Manual Account Login Guarantee <ShieldCheck className="size-4 text-emerald-400" />
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed">
            You do <strong>not</strong> need to apply for expensive Twitter developer keys, LinkedIn corporate app approvals, or Facebook business verification. Enter your account login details directly below.
          </p>
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const session = sessions[platform.id]
          const isConnected = Boolean(session)

          return (
            <div
              key={platform.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-gray-900">{platform.name}</span>
                  </div>
                  {isConnected ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="size-3.5 text-emerald-600" /> Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Not Connected
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mb-4">{platform.tagline}</p>

                {isConnected && session?.accountName && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-800 truncate max-w-[180px]">
                        {session.accountName}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Manual Login
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleOpenModal(platform)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isConnected
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      : 'bg-[#1b1e1c] hover:bg-black text-white'
                  }`}
                >
                  <Key className="size-3.5" />
                  {isConnected ? 'Update Login' : 'Enter Login Details'}
                </button>

                {isConnected && (
                  <button
                    type="button"
                    onClick={() => handleDisconnect(platform.id)}
                    className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition"
                    title="Disconnect account"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Manual Login Modal */}
      {selectedPlatform && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedPlatform(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-black transition"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Manual Account Credentials
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {selectedPlatform.name} Login
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Enter your login details. No API keys or developer accounts required.
              </p>
            </div>

            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Username, Email, or Handle
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    required
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. john_doe or user@domain.com"
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium outline-none focus:border-black focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Account Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium outline-none focus:border-black focus:bg-white transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Leave blank if you only want to save/update the handle name.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Display Label (Optional)
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Main Brand Handle"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium outline-none focus:border-black focus:bg-white transition"
                />
              </div>

              {statusMessage && (
                <div className="p-3 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {statusMessage}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !username.trim()}
                  className="w-full h-12 rounded-xl bg-[#1b1e1c] hover:bg-black text-white font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-4 text-[#eaf79f]" />
                  )}
                  Save & Connect Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
