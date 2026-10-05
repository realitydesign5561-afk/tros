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
    <div className="min-h-screen bg-[#A9B3A7] text-[#1B1E1C] selection:bg-[#EAF79F]/80 p-4 md:p-8 flex flex-col">
      <div className="flex-1 w-full max-w-[1600px] mx-auto rounded-[2.5rem] bg-white shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="container mx-auto flex h-24 items-center justify-between px-8">
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
              <div className="size-10 bg-[#1B1E1C] text-[#EAF79F] rounded-full flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              TROS
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="rounded-full bg-[#1B1E1C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black">
                Get Started
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-8 overflow-y-auto">
          <section className="relative flex flex-col items-center justify-center pt-24 pb-20 text-center">
            
            <h1 className="max-w-4xl text-6xl font-light tracking-tight sm:text-8xl leading-[1.1]">
              The Reality <br/> <span className="font-medium">Operations System</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-gray-500 font-medium sm:text-xl">
              One unified command center to manage your websites, automated social media, lead generation, and course creation—all powered by autonomous AI agents.
            </p>
            
            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/signup" className="flex items-center justify-center gap-2 rounded-full bg-[#EAF79F] px-8 py-4 text-base font-bold text-black transition hover:brightness-95">
                Start Building <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/login" className="flex items-center justify-center gap-2 rounded-full bg-[#F4F5F4] px-8 py-4 text-base font-bold text-black transition hover:bg-gray-200">
                <PlayCircle className="h-5 w-5" /> Sign In
              </Link>
            </div>

            {/* Video Mockup */}
            <div className="mt-24 w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-gray-100 bg-[#F4F5F4] shadow-2xl relative aspect-video flex items-center justify-center">
              <video 
                src="https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_25fps.mp4" 
                autoPlay loop muted playsInline
                className="absolute inset-0 h-full w-full object-cover mix-blend-multiply opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 text-left text-white">
                <h3 className="text-3xl font-medium tracking-tight">Intelligent Operations</h3>
                <p className="mt-2 text-white/80 font-medium">Watch your AI agents scale your business 24/7.</p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-24 max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light tracking-tight sm:text-5xl">Everything you need to scale.</h2>
              <p className="mt-4 text-gray-500 font-medium">TROS replaces a dozen tools with one intelligent system.</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-[2rem] bg-[#F4F5F4] p-10 transition hover:bg-gray-100 flex flex-col h-full">
                <div className="size-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Layers className="h-8 w-8 text-[#1B1E1C]" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Automated Funnels</h3>
                <p className="text-gray-500 font-medium leading-relaxed">Launch entire websites, sales pages, and lead capture forms instantly with our AI Website Factory.</p>
              </div>
              <div className="rounded-[2rem] bg-[#EAF79F] p-10 transition hover:brightness-95 flex flex-col h-full">
                <div className="size-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Zap className="h-8 w-8 text-[#1B1E1C]" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">AI Social Growth</h3>
                <p className="text-gray-700 font-medium leading-relaxed">Connect your accounts and let TROS generate, schedule, and engage with content 24/7 on autopilot.</p>
              </div>
              <div className="rounded-[2rem] bg-[#1B1E1C] p-10 transition hover:bg-black text-white flex flex-col h-full">
                <div className="size-16 bg-[#383B39] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Shield className="h-8 w-8 text-[#EAF79F]" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Secure Operations</h3>
                <p className="text-gray-400 font-medium leading-relaxed">Enterprise-grade security, RBAC roles, and unified analytics across your entire digital presence.</p>
              </div>
            </div>
          </section>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-gray-100 py-10 text-center text-sm font-medium text-gray-400 bg-white z-10">
          <p>© 2026 Reality Design. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
