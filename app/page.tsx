import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'
import { DashboardHome } from '@/components/dashboard-home'
import Link from 'next/link'
import { ArrowRight, PlayCircle, Layers, Zap, Shield, Sparkles } from 'lucide-react'

export default async function Page() {
  const session = await getServerSession(authOptions).catch(() => null)
  
  if (session) {
    return <AuthGuard><DashboardShell><DashboardHome /></DashboardShell></AuthGuard>
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <Sparkles className="h-6 w-6 text-emerald-400" />
            TROS
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-emerald-400 transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 md:px-6">
        <section className="relative flex flex-col items-center justify-center pt-24 pb-32 text-center lg:pt-36">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black"></div>
          
          <h1 className="max-w-4xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl">
            The Reality Operations System
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 sm:text-xl">
            One unified command center to manage your websites, automated social media, lead generation, and course creation—all powered by autonomous AI agents.
          </p>
          
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/signup" className="flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-black transition hover:bg-emerald-400">
              Start Building <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/login" className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
              <PlayCircle className="h-5 w-5" /> Sign In
            </Link>
          </div>

          {/* Video Mockup */}
          <div className="mt-20 w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-gray-900/50 shadow-2xl backdrop-blur-xl relative aspect-video flex items-center justify-center">
            {/* Tech/Dashboard stock video */}
            <video 
              src="https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_25fps.mp4" 
              autoPlay loop muted playsInline
              className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-left">
              <h3 className="text-xl font-bold">Intelligent Operations</h3>
              <p className="text-sm text-gray-400">Watch your AI agents scale your business 24/7.</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to scale.</h2>
            <p className="mt-4 text-gray-400">TROS replaces a dozen tools with one intelligent system.</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:bg-white/10">
              <Layers className="h-10 w-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Automated Funnels</h3>
              <p className="text-gray-400">Launch entire websites, sales pages, and lead capture forms instantly with our AI Website Factory.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:bg-white/10">
              <Zap className="h-10 w-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Social Growth</h3>
              <p className="text-gray-400">Connect your accounts and let TROS generate, schedule, and engage with content 24/7 on autopilot.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:bg-white/10">
              <Shield className="h-10 w-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Operations</h3>
              <p className="text-gray-400">Enterprise-grade security, RBAC roles, and unified analytics across your entire digital presence.</p>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-sm text-gray-500">
        <p>© 2026 Reality Design. All rights reserved.</p>
      </footer>
    </div>
  )
}
