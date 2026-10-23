'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Activity,
  Bot,
  Boxes,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clapperboard,
  Cpu,
  FolderOpen,
  Globe2,
  LayoutGrid,
  LineChart,
  LogOut,
  Megaphone,
  Menu,
  Palette,
  PlaySquare,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  Terminal,
  Users,
  Workflow,
  X,
} from 'lucide-react'

interface NavSection {
  title: string
  items: {
    label: string
    href: string
    icon: any
    badge?: string
  }[]
}

const navSections: NavSection[] = [
  {
    title: 'Command & Agents',
    items: [
      { label: 'Overview', href: '/', icon: LayoutGrid },
      { label: 'AI Command Center', href: '/command-center', icon: Terminal, badge: 'Direct' },
      { label: 'AI Workforce (20 Agents)', href: '/agents', icon: Bot, badge: '20' },
    ],
  },
  {
    title: 'Creation & Studio',
    items: [
      { label: 'Website Factory', href: '/website-factory', icon: Globe2 },
      { label: 'Creative Studio', href: '/designer', icon: Palette },
      { label: '3D Procedural Studio', href: '/3d-studio', icon: Boxes, badge: 'PBR' },
      { label: 'AI Course Studio', href: '/courses', icon: Clapperboard, badge: 'Studio' },
      { label: 'Faceless YouTube OS', href: '/youtube-os', icon: PlaySquare },
    ],
  },
  {
    title: 'Growth & Business',
    items: [
      { label: 'Social Media Manager', href: '/social', icon: Megaphone },
      { label: 'Social Accounts (Manual)', href: '/social/connections', icon: ShieldCheck, badge: 'No API' },
      { label: 'Google Business Manager', href: '/google-business', icon: Store },
      { label: 'Lead Gen & CRM', href: '/leads', icon: Users },
      { label: 'Workflow Automation', href: '/workflows', icon: Workflow },
    ],
  },
  {
    title: 'Agency Operations',
    items: [
      { label: 'Client Projects', href: '/clients', icon: Briefcase },
      { label: 'Asset Library', href: '/assets', icon: FolderOpen },
      { label: 'Business Analytics', href: '/analytics', icon: LineChart },
      { label: 'AI Providers & Gateway', href: '/ai-providers', icon: Cpu },
      { label: 'System Operations', href: '/admin/dashboard', icon: Activity },
      { label: 'Settings & Integrations', href: '/settings', icon: Settings },
    ],
  },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // Mobile sidebar drawer state
  const [mobileOpen, setMobileOpen] = useState(false)

  // Desktop collapsible sidebar state (saved in localStorage if browser allows)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  // Omnipresent Global Command Bar
  const [globalPrompt, setGlobalPrompt] = useState('')
  const [dispatching, setDispatching] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
    setMobileSearchOpen(false)
  }, [pathname])

  // Prevent background body scrolling when mobile drawer or mobile search modal is open
  useEffect(() => {
    if (mobileOpen || mobileSearchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen, mobileSearchOpen])

  // Keyboard shortcut listener: Escape closes mobile drawer; Cmd+K / Ctrl+K focuses command bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setMobileSearchOpen(false)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setMobileSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto focus mobile search input when opened
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 80)
    }
  }, [mobileSearchOpen])

  const handleGlobalCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!globalPrompt.trim() || dispatching) return

    setDispatching(true)
    try {
      const res = await fetch('/api/agent/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: globalPrompt.trim() }),
      })
      if (res.ok) {
        setGlobalPrompt('')
        setMobileOpen(false)
        setMobileSearchOpen(false)
        router.push('/command-center')
      }
    } catch {
      // ignore
    } finally {
      setDispatching(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0c0b] text-[#f4f5f4] flex flex-col antialiased selection:bg-[#eaf79f] selection:text-black">
      {/* Top Navbar */}
      <header className="h-16 border-b border-white/10 bg-[#141615]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 gap-2 sm:gap-4">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden flex items-center justify-center size-10 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
          >
            <Menu className="size-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-[#eaf79f] text-black flex items-center justify-center font-black tracking-tighter text-sm shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="size-4" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-base leading-none">TROS</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-widest font-semibold text-[#eaf79f] bg-[#eaf79f]/10 border border-[#eaf79f]/20 px-2 py-0.5 rounded-full">
                Business OS
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Global Command Bar */}
        <form
          onSubmit={handleGlobalCommandSubmit}
          className="hidden md:flex flex-1 max-w-xl mx-2 relative items-center"
        >
          <div className="relative w-full">
            <input
              type="text"
              value={globalPrompt}
              onChange={(e) => setGlobalPrompt(e.target.value)}
              placeholder="Describe an outcome (e.g. 'Create a complete beginner course on web design using AI')..."
              className="w-full bg-[#0a0c0b] border border-white/10 rounded-2xl py-2 pl-9 pr-20 text-xs text-white placeholder:text-white/35 outline-none focus:border-[#eaf79f] transition shadow-inner"
            />
            <Terminal className="size-3.5 text-[#eaf79f] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {dispatching ? (
                <span className="text-[10px] text-[#eaf79f] font-bold px-1.5 py-0.5 animate-pulse">
                  Dispatching...
                </span>
              ) : (
                <kbd className="hidden lg:inline-block text-[10px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded border border-white/10">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>
        </form>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile search trigger */}
          <button
            type="button"
            aria-label="Open command search"
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden flex items-center justify-center size-9 rounded-xl bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <Search className="size-4 text-[#eaf79f]" />
          </button>

          <Link
            href="/command-center"
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#eaf79f] text-black px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-white transition shadow-sm active:scale-95"
          >
            <Terminal className="size-3.5 sm:size-4 shrink-0" />
            <span className="hidden sm:inline">AI Command Center</span>
            <span className="sm:hidden text-xs">Command</span>
          </Link>

          <Link
            href="/settings"
            title="Settings"
            className="flex items-center justify-center size-9 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <Settings className="size-4" />
          </Link>

          <Link
            href="/profile"
            title="Profile & Settings"
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-xs"
          >
            <CircleUserRound className="size-4 sm:size-5 text-[#eaf79f]" />
            <span className="hidden lg:inline font-medium text-white/90 max-w-28 truncate">
              Reality Design
            </span>
          </Link>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop Overlay */}
        <div
          role="presentation"
          aria-hidden={!mobileOpen}
          onClick={() => setMobileOpen(false)}
          className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Mobile Navigation Drawer */}
        <aside
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
          className={`fixed inset-y-0 left-0 z-50 w-[84vw] max-w-xs bg-[#121413] border-r border-white/10 flex flex-col shadow-2xl transition-transform duration-300 ease-out md:hidden ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#161817]">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-[#eaf79f] text-black flex items-center justify-center font-bold text-xs">
                <Sparkles className="size-3.5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white">TROS Navigation</span>
                <p className="text-[10px] text-white/50">Reality Operations OS</p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center size-9 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition active:scale-95"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Quick Directive Command Box inside Mobile Drawer */}
          <div className="p-3 border-b border-white/5 bg-[#0e100f]">
            <form onSubmit={handleGlobalCommandSubmit} className="relative">
              <input
                type="text"
                value={globalPrompt}
                onChange={(e) => setGlobalPrompt(e.target.value)}
                placeholder="Describe outcome to build..."
                className="w-full bg-[#161817] border border-white/10 rounded-xl py-2 pl-8 pr-16 text-xs text-white placeholder:text-white/40 outline-none focus:border-[#eaf79f]"
              />
              <Terminal className="size-3.5 text-[#eaf79f] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                disabled={!globalPrompt.trim() || dispatching}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg bg-[#eaf79f] text-black text-[10px] font-bold disabled:opacity-30"
              >
                Go
              </button>
            </form>
          </div>

          {/* Navigation Links Scrollable */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
                  {section.title}
                </p>
                <div className="space-y-0.5 mt-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/' && pathname.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-[#eaf79f] text-black font-semibold shadow-sm'
                            : 'text-white/75 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`size-4 shrink-0 ${isActive ? 'text-black' : 'text-white/50'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                              isActive
                                ? 'bg-black text-[#eaf79f]'
                                : 'bg-white/10 text-white/80'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Drawer Footer */}
          <div className="p-3 border-t border-white/10 bg-[#0e100f] space-y-2">
            <div className="flex items-center justify-between px-2 py-1 text-xs text-white/60">
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="size-2 rounded-full bg-emerald-400" /> System Healthy
              </span>
              <span className="text-[10px] font-mono text-white/40">v2.4-TROS</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center justify-center gap-2 min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="size-3.5" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Desktop Sidebar (Collapsible: w-72 or w-18) */}
        <aside
          aria-label="Sidebar navigation"
          className={`hidden md:flex flex-col bg-[#121413] border-r border-white/10 transition-all duration-200 ease-in-out shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-20 ${
            sidebarExpanded ? 'w-72' : 'w-[72px]'
          }`}
        >
          {/* Sidebar Collapse / Expand Toggle Button */}
          <div className="flex items-center justify-end px-3 py-2 border-b border-white/5">
            <button
              type="button"
              onClick={() => setSidebarExpanded((prev) => !prev)}
              aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              className="flex items-center justify-center size-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
              title={sidebarExpanded ? 'Collapse sidebar (Ctrl+\\)' : 'Expand sidebar'}
            >
              {sidebarExpanded ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-6">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                {sidebarExpanded && (
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/40 truncate">
                    {section.title}
                  </p>
                )}
                <div className="space-y-0.5 mt-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/' && pathname.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={!sidebarExpanded ? item.label : undefined}
                        className={`flex items-center ${
                          sidebarExpanded ? 'justify-between px-3' : 'justify-center px-2'
                        } py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-[#eaf79f] text-black font-semibold shadow-sm'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`size-4 shrink-0 ${isActive ? 'text-black' : 'text-white/50'}`} />
                          {sidebarExpanded && <span className="truncate">{item.label}</span>}
                        </div>
                        {sidebarExpanded && item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                              isActive
                                ? 'bg-black text-[#eaf79f]'
                                : 'bg-white/10 text-white/80'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Sidebar Footer */}
          <div className="p-2 border-t border-white/10 bg-[#0e100f]/60 space-y-1">
            {sidebarExpanded ? (
              <>
                <div className="flex items-center justify-between px-2 py-1 text-xs text-white/60">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span className="size-2 rounded-full bg-emerald-400" /> Healthy
                  </span>
                  <span className="text-[10px] font-mono text-white/40">v2.4-TROS</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition"
                >
                  <LogOut className="size-3.5" /> Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                title="Sign Out"
                className="w-full flex items-center justify-center p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut className="size-4" />
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Area: Fully Responsive & Accessible */}
        <main
          id="main-content"
          role="main"
          className="flex-1 min-w-0 overflow-y-auto bg-[#0a0c0b] p-3 sm:p-6 lg:p-8"
        >
          {children}
        </main>
      </div>

      {/* Mobile Global Search Modal (triggered by search icon or Cmd+K) */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#eaf79f] flex items-center gap-1.5">
              <Terminal className="size-3.5" /> Direct Business Outcome Command
            </span>
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 rounded-xl text-white/60 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleGlobalCommandSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                ref={mobileSearchInputRef as any}
                rows={3}
                value={globalPrompt}
                onChange={(e) => setGlobalPrompt(e.target.value)}
                placeholder="Describe an outcome (e.g. 'Create a complete beginner course on web design using AI and prepare it for sale')..."
                className="w-full p-4 rounded-2xl bg-[#141615] border border-white/20 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#eaf79f] resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-white/50">Press Enter or tap Execute</p>
              <button
                type="submit"
                disabled={!globalPrompt.trim() || dispatching}
                className="px-5 py-2.5 rounded-xl bg-[#eaf79f] text-black font-bold text-xs hover:bg-white transition disabled:opacity-40"
              >
                {dispatching ? 'Dispatching...' : 'Execute Directive'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
