'use client'

import { useState, useEffect, useRef } from 'react'
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
  Zap,
} from 'lucide-react'
import { GeminiChatbot } from '@/components/gemini-chatbot'

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
    title: 'Core Engines',
    items: [
      { label: 'Overview', href: '/', icon: LayoutGrid },
      { label: 'YouTube OS', href: '/youtube-os', icon: PlaySquare, badge: 'YPP' },
      { label: 'AI Command Center', href: '/command-center', icon: Terminal, badge: 'Exec' },
      { label: 'Website Factory', href: '/website-factory', icon: Globe2, badge: 'Full-Stack' },
      { label: 'AI Course Studio', href: '/courses', icon: Clapperboard, badge: 'Studio' },
      { label: 'Creative Studio', href: '/designer', icon: Palette, badge: 'Design' },
      { label: '3D Procedural Studio', href: '/3d-studio', icon: Boxes },
    ],
  },
  {
    title: 'Workforce & Growth',
    items: [
      { label: '20 AI Agents', href: '/agents', icon: Bot, badge: '20' },
      { label: 'Social Media Manager', href: '/social', icon: Megaphone },
      { label: 'Social Accounts', href: '/social/connections', icon: ShieldCheck, badge: 'Manual' },
      { label: 'Google Business', href: '/google-business', icon: Store },
      { label: 'Lead Gen & CRM', href: '/leads', icon: Users },
      { label: 'Workflow Automations', href: '/workflows', icon: Workflow },
    ],
  },
  {
    title: 'Operations & Agency',
    items: [
      { label: 'Client Projects', href: '/clients', icon: Briefcase },
      { label: 'Asset Library', href: '/assets', icon: FolderOpen },
      { label: 'Analytics', href: '/analytics', icon: LineChart },
      { label: 'AI Gateway', href: '/ai-providers', icon: Cpu },
      { label: 'System Health', href: '/admin/dashboard', icon: Activity },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

// Straight-to-the-point quick navigation bar
const quickNav = [
  { label: 'Overview', href: '/' },
  { label: 'YouTube OS', href: '/youtube-os', activeColor: 'text-blue-400' },
  { label: 'Command Center', href: '/command-center' },
  { label: 'Website Factory', href: '/website-factory' },
  { label: 'Course Studio', href: '/courses' },
  { label: 'Creative Studio', href: '/designer' },
  { label: 'Social', href: '/social' },
  { label: 'Workflows', href: '/workflows' },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [globalPrompt, setGlobalPrompt] = useState('')
  const [dispatching, setDispatching] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMobileOpen(false)
    setMobileSearchOpen(false)
  }, [pathname])

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
        router.push('/command-center')
      }
    } catch {
      // ignore
    } finally {
      setDispatching(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-200 flex flex-col antialiased selection:bg-blue-600/30 selection:text-white">
      {/* Sleek, Non-Bulky Top Navigation Header */}
      <header className="h-12 border-b border-[#1a202c] bg-[#0b0e14]/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 gap-3">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            aria-label="Toggle Navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden flex items-center justify-center size-8 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Menu className="size-4" />
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="size-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">TROS</span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700/60">
                OS
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Quick Direct Navigation Tabs (High Density, Straight to the Point) */}
        <nav className="hidden lg:flex items-center gap-1">
          {quickNav.map((tab) => {
            const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>

        {/* Center-Right: Compact Command Bar */}
        <form
          onSubmit={handleGlobalCommandSubmit}
          className="hidden md:flex flex-1 max-w-xs xl:max-w-sm relative items-center"
        >
          <div className="relative w-full">
            <input
              type="text"
              value={globalPrompt}
              onChange={(e) => setGlobalPrompt(e.target.value)}
              placeholder="Quick prompt (e.g. Christian sleep prayer video)..."
              className="w-full bg-[#12161f] border border-[#1e2533] rounded-md py-1 pl-7 pr-12 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500 transition"
            />
            <Terminal className="size-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <kbd className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono bg-slate-800 text-slate-400 px-1 py-0.5 rounded border border-slate-700">
              ⌘K
            </kbd>
          </div>
        </form>

        {/* Right: Direct Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/command-center"
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 text-xs font-medium transition shadow-sm active:scale-95"
          >
            <Zap className="size-3 shrink-0" />
            <span className="hidden sm:inline">Run Command</span>
            <span className="sm:hidden">Run</span>
          </Link>

          <Link
            href="/settings"
            title="Settings"
            className="flex items-center justify-center size-7 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Settings className="size-3.5" />
          </Link>

          <Link
            href="/profile"
            title="Account"
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <CircleUserRound className="size-3.5 text-blue-400" />
            <span className="hidden xl:inline text-xs">Admin</span>
          </Link>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Navigation Drawer */}
        <aside
          role="dialog"
          aria-modal="true"
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0b0e14] border-r border-[#1a202c] flex flex-col shadow-2xl transition-transform duration-200 md:hidden ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-3 border-b border-[#1a202c]">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">
                <Sparkles className="size-3" />
              </div>
              <span className="font-bold text-xs text-white">TROS Navigation</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {navSections.map((sec) => (
              <div key={sec.title} className="space-y-0.5">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {sec.title}
                </p>
                {sec.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className="size-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] px-1 py-0.2 rounded font-mono bg-slate-800 text-slate-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-[#1a202c]">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-rose-400 hover:bg-rose-500/10 transition"
            >
              <LogOut className="size-3.5" /> Sign Out
            </button>
          </div>
        </aside>

        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          />
        )}

        {/* Compact, Non-Bulky Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col bg-[#0b0e14] border-r border-[#1a202c] transition-all duration-150 shrink-0 sticky top-12 h-[calc(100vh-3rem)] z-20 ${
            sidebarExpanded ? 'w-56' : 'w-12'
          }`}
        >
          {/* Collapse Button */}
          <div className="flex items-center justify-end px-2 py-1.5 border-b border-[#1a202c]/50">
            <button
              type="button"
              onClick={() => setSidebarExpanded((prev) => !prev)}
              className="flex items-center justify-center size-5 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition"
              title={sidebarExpanded ? 'Collapse' : 'Expand'}
            >
              {sidebarExpanded ? <ChevronLeft className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            </button>
          </div>

          {/* Links */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-3.5">
            {navSections.map((sec) => (
              <div key={sec.title} className="space-y-0.5">
                {sidebarExpanded && (
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                    {sec.title}
                  </p>
                )}
                {sec.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={!sidebarExpanded ? item.label : undefined}
                      className={`flex items-center ${
                        sidebarExpanded ? 'justify-between px-2' : 'justify-center p-1.5'
                      } py-1.5 rounded-md text-xs transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-medium shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className={`size-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        {sidebarExpanded && <span className="truncate">{item.label}</span>}
                      </div>
                      {sidebarExpanded && item.badge && (
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                            isActive
                              ? 'bg-blue-700 text-white'
                              : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-[#1a202c]">
            {sidebarExpanded ? (
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400" /> Online
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="hover:text-rose-400 transition"
                  title="Sign Out"
                >
                  <LogOut className="size-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                title="Sign Out"
                className="w-full flex items-center justify-center p-1 text-slate-500 hover:text-rose-400"
              >
                <LogOut className="size-3.5" />
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Workspace (Compact margins, high density) */}
        <main className="flex-1 overflow-y-auto bg-[#090b10] p-3 sm:p-5">
          <div className="max-w-6xl mx-auto space-y-5">
            {children}
          </div>
        </main>
      </div>

      <GeminiChatbot />
    </div>
  )
}
