'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Briefcase,
  CheckCircle2,
  Clapperboard,
  Coins,
  Cpu,
  Globe2,
  LayoutGrid,
  LineChart,
  Megaphone,
  MonitorPlay,
  Palette,
  PlaySquare,
  Radio,
  Search,
  Sparkles,
  Store,
  Terminal,
  TrendingUp,
  Users,
  Workflow,
  Zap,
} from 'lucide-react'

export function DashboardHome() {
  const [quickPrompt, setQuickPrompt] = useState('')
  const [mcpStatus, setMcpStatus] = useState<any>(null)
  const [tasksCount, setTasksCount] = useState(0)

  useEffect(() => {
    // Query MCP status
    fetch('/api/activepieces/connection')
      .then((r) => r.ok && r.json())
      .then((data) => setMcpStatus(data))
      .catch(() => null)

    // Query tasks
    fetch('/api/agent/tasks')
      .then((r) => r.ok && r.json())
      .then((data) => setTasksCount(data?.tasks?.length || 0))
      .catch(() => null)
  }, [])

  const coreModules = [
    {
      title: 'AI Command Center',
      tagline: 'Multi-Agent Operations',
      desc: 'Decompose complex business requests into 20-agent coordinated execution plans.',
      href: '/command-center',
      icon: Terminal,
      color: 'bg-[#eaf79f] text-black',
      badge: 'Executive',
    },
    {
      title: 'Website Factory',
      tagline: 'Prompt-to-Application',
      desc: 'Build full-stack Next.js web applications, databases, and APIs from natural language.',
      href: '/website-factory',
      icon: Globe2,
      color: 'bg-[#1a1c1a] text-white border border-white/10',
      badge: 'Full-Stack',
    },
    {
      title: 'Creative Studio',
      tagline: 'Luxury Editorial Graphics',
      desc: 'Generate commercial birthday flyers, event posters, banners, and vector layers.',
      href: '/designer',
      icon: Palette,
      color: 'bg-[#1a1c1a] text-white border border-white/10',
      badge: 'Design',
    },
    {
      title: 'Faceless YouTube OS',
      tagline: 'Niche & Script Automation',
      desc: 'Discover high-CPM niches, research viral titles, and generate complete video scripts.',
      href: '/youtube-os',
      icon: PlaySquare,
      color: 'bg-[#1a1c1a] text-white border border-white/10',
      badge: 'Video',
    },
    {
      title: 'Social Media OS',
      tagline: 'Direct Account Publishing',
      desc: 'Publish across Twitter/X, LinkedIn, Instagram, Facebook, TikTok, and Threads.',
      href: '/social/calendar',
      icon: Megaphone,
      color: 'bg-[#1a1c1a] text-white border border-white/10',
      badge: 'Omnichannel',
    },
    {
      title: 'Lead Gen & CRM',
      tagline: 'High-Conversion Prospects',
      desc: 'Audit target businesses, score opportunities, and prepare personalized proposals.',
      href: '/leads',
      icon: Users,
      color: 'bg-[#1a1c1a] text-white border border-white/10',
      badge: 'Sales',
    },
    {
      title: 'Google Business Manager',
      tagline: 'Local SEO Dominance',
      desc: 'Manage business profiles, draft weekly search updates, and respond to customer reviews.',
      href: '/google-business',
      icon: Store,
      color: 'bg-[#1a1c1a] text-white border border-white/10',
      badge: 'Local SEO',
    },
    {
      title: 'Client Workspaces',
      tagline: 'Agency Operations',
      desc: 'Manage client deliverables, brand kits, purchased services, and retainers.',
      href: '/clients',
      icon: Briefcase,
      color: 'bg-[#1a1c1a] text-white border border-white/10',
      badge: 'Agency',
    },
    {
      title: 'Activepieces MCP Workflows',
      tagline: 'Model Context Protocol',
      desc: 'Visual automation builder dispatching to Activepieces remote MCP server.',
      href: '/workflows',
      icon: Workflow,
      color: 'bg-[#1a1c1a] text-white border border-white/10',
      badge: 'Automation',
    },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome & Command Hero */}
      <div className="rounded-3xl bg-[#141615] border border-white/10 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#eaf79f]/15 via-transparent to-transparent pointer-events-none blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#eaf79f] bg-[#eaf79f]/10 border border-[#eaf79f]/20 px-2.5 py-0.5 rounded-full">
              Reality Operation System
            </span>
            <span className="text-xs text-white/50">Primary Operator: Reality Design</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold ml-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" /> 20 Specialized Agents Ready
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-white leading-tight">
            The Reality <span className="font-semibold text-[#eaf79f]">Operation System</span>
          </h1>

          <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl">
            One unified command center to run your creative, digital services, website development, video, social media, and client acquisition operations.
          </p>

          {/* Natural Language Command Bar */}
          <div className="pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (quickPrompt.trim()) {
                  window.location.href = `/command-center?prompt=${encodeURIComponent(quickPrompt.trim())}`
                }
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1">
                <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Tell TROS what to do... (e.g. Find real estate clients needing websites and draft proposals)"
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  className="w-full h-12 rounded-2xl bg-[#0a0c0b] border border-white/10 pl-11 pr-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#eaf79f] transition"
                />
              </div>
              <button
                type="submit"
                className="h-12 px-6 rounded-2xl bg-[#eaf79f] text-black font-bold text-sm hover:bg-white transition flex items-center justify-center gap-2 shrink-0 shadow-lg"
              >
                <Zap className="size-4" /> Execute in Command Center
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Real Platform Status Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-white/10 bg-[#121413] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              Activepieces MCP
            </span>
            <p className="text-sm font-semibold text-white mt-0.5">
              {mcpStatus?.connected ? 'Live Connected' : 'Remote Endpoint Ready'}
            </p>
            <p className="text-[11px] text-white/50">
              {mcpStatus?.toolsCount ? `${mcpStatus.toolsCount} Verified Tools` : 'OAuth PKCE Handshake'}
            </p>
          </div>
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Radio className="size-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-[#121413] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              Social Channels
            </span>
            <p className="text-sm font-semibold text-white mt-0.5">Direct Manual Access</p>
            <p className="text-[11px] text-white/50">Twitter, LinkedIn, IG, FB, TikTok</p>
          </div>
          <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Megaphone className="size-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-[#121413] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              Agent Workforce
            </span>
            <p className="text-sm font-semibold text-white mt-0.5">20 Specialized Agents</p>
            <p className="text-[11px] text-white/50">Least-Privilege Roles</p>
          </div>
          <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Bot className="size-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-[#121413] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              Database & Security
            </span>
            <p className="text-sm font-semibold text-white mt-0.5">AES-256 Encrypted</p>
            <p className="text-[11px] text-white/50">Neon PostgreSQL DB</p>
          </div>
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="size-4" />
          </div>
        </div>
      </div>

      {/* Core Business Operations Modules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Creative & Digital Business Modules</h2>
            <p className="text-xs text-white/50">Access your specialized creation engines, pipelines, and agency tooling.</p>
          </div>
          <Link href="/agents" className="text-xs font-semibold text-[#eaf79f] hover:underline flex items-center gap-1">
            View All 20 Agents <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {coreModules.map((mod) => {
            const Icon = mod.icon
            return (
              <Link
                key={mod.title}
                href={mod.href}
                className={`p-6 rounded-3xl ${mod.color} flex flex-col justify-between transition-transform hover:-translate-y-1 shadow-lg group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="size-10 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10">
                      {mod.badge}
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold uppercase tracking-wider opacity-60">
                    {mod.tagline}
                  </p>
                  <h3 className="text-xl font-bold tracking-tight mt-1 group-hover:underline">
                    {mod.title}
                  </h3>
                  <p className="text-xs opacity-70 mt-2.5 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-current/10 flex items-center justify-between text-xs font-semibold">
                  <span>Open Module</span>
                  <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}
