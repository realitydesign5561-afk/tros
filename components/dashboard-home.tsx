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
  Cpu,
  Globe2,
  LayoutGrid,
  LineChart,
  Megaphone,
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
    fetch('/api/activepieces/connection')
      .then((r) => r.ok && r.json())
      .then((data) => setMcpStatus(data))
      .catch(() => null)

    fetch('/api/agent/tasks')
      .then((r) => r.ok && r.json())
      .then((data) => setTasksCount(data?.tasks?.length || 0))
      .catch(() => null)
  }, [])

  const coreModules = [
    {
      title: 'YouTube OS',
      tagline: 'Christian Niche · YPP Auto-Pilot',
      desc: 'Christian content discovery, algorithm retention hooks, Omni Flash video, Nano Banana thumbnails, and daily automated posting.',
      href: '/youtube-os',
      icon: PlaySquare,
      badge: 'Monetization',
      accent: 'border-blue-500/30 bg-blue-950/15',
    },
    {
      title: 'AI Command Center',
      tagline: 'Multi-Agent Operations',
      desc: 'Execute natural language directives with 20-agent coordinated execution plans and dependency trees.',
      href: '/command-center',
      icon: Terminal,
      badge: 'Autonomous',
      accent: 'border-[#1a202c] bg-[#0f131a]',
    },
    {
      title: 'Website Factory',
      tagline: 'Prompt-to-Application',
      desc: 'Generate full Next.js web applications, databases, custom domains, and deployable live previews.',
      href: '/website-factory',
      icon: Globe2,
      badge: 'Full-Stack',
      accent: 'border-[#1a202c] bg-[#0f131a]',
    },
    {
      title: 'AI Course Studio',
      tagline: 'Curriculum & Video LMS',
      desc: 'End-to-end studio for courses, lesson scripts, assessments, certificates, and learner portals.',
      href: '/courses',
      icon: Clapperboard,
      badge: 'LMS Studio',
      accent: 'border-[#1a202c] bg-[#0f131a]',
    },
    {
      title: 'Creative Studio',
      tagline: 'Graphic & Motion Studio',
      desc: 'Generate commercial flyers, banners, and Omni Flash motion design video clips.',
      href: '/designer',
      icon: Palette,
      badge: 'Creative',
      accent: 'border-[#1a202c] bg-[#0f131a]',
    },
    {
      title: 'Social Media OS',
      tagline: 'Direct Multi-Channel',
      desc: 'Plan, write, and schedule content across Twitter/X, LinkedIn, Instagram, Facebook, and TikTok.',
      href: '/social/calendar',
      icon: Megaphone,
      badge: 'Social',
      accent: 'border-[#1a202c] bg-[#0f131a]',
    },
    {
      title: 'Lead Gen & CRM',
      tagline: 'Prospects & Outreach',
      desc: 'Audit target companies, score opportunities, and automate cold outreach sequences.',
      href: '/leads',
      icon: Users,
      badge: 'Pipeline',
      accent: 'border-[#1a202c] bg-[#0f131a]',
    },
    {
      title: 'Google Business Manager',
      tagline: 'Local Search & Reviews',
      desc: 'Manage GBP listings, draft weekly updates, and automate review responses.',
      href: '/google-business',
      icon: Store,
      badge: 'Local SEO',
      accent: 'border-[#1a202c] bg-[#0f131a]',
    },
    {
      title: 'Workflow Automation',
      tagline: 'Model Context Protocol',
      desc: 'Visual workflow engine connected to Activepieces remote MCP server and background jobs.',
      href: '/workflows',
      icon: Workflow,
      badge: 'MCP',
      accent: 'border-[#1a202c] bg-[#0f131a]',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Sleek, Compact Directive Bar (Straight to the point) */}
      <div className="rounded-lg bg-[#0f131a] border border-[#1a202c] p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>TROS Reality Operations System</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                20 Agents Ready
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter any business outcome below. The system automatically coordinates agents and tools to execute.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <span className="flex items-center gap-1 font-mono text-[11px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
              YPP Monetization Active
            </span>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (quickPrompt.trim()) {
              window.location.href = `/command-center?prompt=${encodeURIComponent(quickPrompt.trim())}`
            }
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Describe outcome to execute (e.g. Find best selling Christian content and automate daily posts)..."
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              className="w-full h-9 rounded-md bg-[#090b10] border border-[#1a202c] pl-8 pr-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            className="h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <Zap className="size-3.5" /> Execute Directive
          </button>
        </form>
      </div>

      {/* High-Density Operational Status Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <Link
          href="/youtube-os"
          className="p-3 rounded-lg border border-[#1a202c] bg-[#0f131a] hover:border-slate-700 transition flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500">YouTube OS</span>
            <p className="text-xs font-semibold text-white mt-0.5">420/1,000 Subs · 1,840h</p>
            <p className="text-[10px] text-emerald-400 font-medium">Daily Auto-Pilot: On</p>
          </div>
          <PlaySquare className="size-4 text-blue-400" />
        </Link>

        <Link
          href="/command-center"
          className="p-3 rounded-lg border border-[#1a202c] bg-[#0f131a] hover:border-slate-700 transition flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500">Agent Tasks</span>
            <p className="text-xs font-semibold text-white mt-0.5">{tasksCount} Active Tasks</p>
            <p className="text-[10px] text-slate-400">20 Specialized Agents</p>
          </div>
          <Bot className="size-4 text-purple-400" />
        </Link>

        <Link
          href="/workflows"
          className="p-3 rounded-lg border border-[#1a202c] bg-[#0f131a] hover:border-slate-700 transition flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500">MCP Workflows</span>
            <p className="text-xs font-semibold text-white mt-0.5">Activepieces Ready</p>
            <p className="text-[10px] text-slate-400">Automated Background Jobs</p>
          </div>
          <Radio className="size-4 text-amber-400" />
        </Link>

        <Link
          href="/ai-providers"
          className="p-3 rounded-lg border border-[#1a202c] bg-[#0f131a] hover:border-slate-700 transition flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500">AI Gateway</span>
            <p className="text-xs font-semibold text-white mt-0.5">Gemini + Omni Flash</p>
            <p className="text-[10px] text-emerald-400">Encrypted &amp; Online</p>
          </div>
          <CheckCircle2 className="size-4 text-emerald-400" />
        </Link>
      </div>

      {/* Compact Modules Grid (Non-Bulky, Straight to the Point) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Production Engines</h2>
          <Link href="/command-center" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
            Open Command Center →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {coreModules.map((mod) => {
            const Icon = mod.icon
            return (
              <Link
                key={mod.title}
                href={mod.href}
                className={`p-3.5 rounded-lg border ${mod.accent} hover:border-slate-600 transition flex flex-col justify-between group shadow-xs`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded bg-slate-800 flex items-center justify-center text-blue-400">
                        <Icon className="size-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        {mod.title}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                      {mod.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#1a202c] flex items-center justify-between text-[11px] font-medium text-slate-500 group-hover:text-blue-400 transition-colors">
                  <span>Launch Engine</span>
                  <ArrowUpRight className="size-3" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
