import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'
import { DashboardHome } from '@/components/dashboard-home'
import Link from 'next/link'
import { ArrowRight, PlayCircle, Layers, Zap, Shield, Sparkles, Terminal, PlaySquare, Globe2 } from 'lucide-react'

export default async function Page() {
  const session = await getServerSession(authOptions).catch(() => null)

  if (session) {
    return (
      <AuthGuard>
        <DashboardShell>
          <DashboardHome />
        </DashboardShell>
      </AuthGuard>
    )
  }

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-200 selection:bg-blue-600/30 selection:text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0b0e14]/90 backdrop-blur-md border-b border-[#1a202c]">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 font-bold text-base text-white">
            <div className="size-7 bg-blue-600 text-white rounded-md flex items-center justify-center shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>TROS</span>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 rounded">
              OS
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-md bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-all shadow-xs active:scale-95"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section (Compact & Straight to the Point) */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-5">
          <Terminal className="size-3" />
          Autonomous Multi-Agent AI Business Operating System
        </div>

        <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl text-white leading-tight">
          The Reality Operations System
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-slate-400 leading-relaxed">
          Unified command center to orchestrate websites, autonomous YouTube media, lead generation,
          and AI course production—coordinated by 20 multi-agent workflows.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-2.5 sm:justify-center w-full max-w-xs">
          <Link
            href="/auth/signup"
            className="flex items-center justify-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition-all shadow-xs"
          >
            Start Building <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 rounded-md bg-[#12151c] hover:bg-slate-800 border border-[#1a202c] px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <PlayCircle className="h-3.5 w-3.5" /> Sign In
          </Link>
        </div>

        {/* Feature Cards (Compact, Non-Bulky) */}
        <section className="mt-12 w-full grid gap-3 sm:grid-cols-3 text-left">
          <div className="rounded-lg bg-[#0f131a] border border-[#1a202c] p-4 flex flex-col justify-between">
            <div>
              <div className="size-8 bg-blue-500/10 border border-blue-500/20 rounded-md flex items-center justify-center mb-3 text-blue-400">
                <PlaySquare className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">YouTube OS</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Automated Christian content research, algorithm retention hooks, Omni Flash video, and Nano Banana thumbnails.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-[#0f131a] border border-[#1a202c] p-4 flex flex-col justify-between">
            <div>
              <div className="size-8 bg-blue-500/10 border border-blue-500/20 rounded-md flex items-center justify-center mb-3 text-blue-400">
                <Globe2 className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Website Factory</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Build full-stack Next.js web applications, custom domains, and deployable live previews from prompts.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-[#0f131a] border border-[#1a202c] p-4 flex flex-col justify-between">
            <div>
              <div className="size-8 bg-blue-500/10 border border-blue-500/20 rounded-md flex items-center justify-center mb-3 text-blue-400">
                <Terminal className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">20 AI Agents</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Autonomous multi-agent execution with dependency graphs, provider fallback, and usage tracking.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a202c] py-4 text-center text-xs text-slate-500 bg-[#0b0e14]">
        <p>© 2026 TROS Reality Operations System. All rights reserved.</p>
      </footer>
    </div>
  )
}
