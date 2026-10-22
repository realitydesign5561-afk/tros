'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Activity,
  Bot,
  Boxes,
  Briefcase,
  ChevronRight,
  CircleUserRound,
  Clapperboard,
  Cpu,
  Database,
  ExternalLink,
  FolderOpen,
  Gauge,
  Globe2,
  HardDrive,
  LayoutGrid,
  Layers,
  LineChart,
  LogOut,
  Megaphone,
  Menu,
  MonitorPlay,
  Palette,
  PlaySquare,
  Radio,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Store,
  Terminal,
  TrendingUp,
  Users,
  Video,
  Workflow,
  Wrench,
  X,
  Zap,
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
      { label: 'Video Studio', href: '/courses', icon: Clapperboard },
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  // Determine current page title
  const getCurrentTitle = () => {
    if (pathname === '/') return 'Reality Operations Overview'
    for (const section of navSections) {
      for (const item of section.items) {
        if (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) {
          return item.label
        }
      }
    }
    return pathname.slice(1).replaceAll('-', ' ')
  }

  return (
    <div className="min-h-screen bg-[#0e100f] text-[#f4f5f4] flex flex-col antialiased selection:bg-[#eaf79f] selection:text-black">
      {/* Top Navbar */}
      <header className="h-16 border-b border-white/10 bg-[#141615]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
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

        {/* Center Quick Stats / Active Route */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/60">Active Workspace:</span>
            <span className="font-semibold text-white">Reality Design</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Radio className="size-3 text-amber-400" />
            <span className="text-white/60">MCP Server:</span>
            <span className="font-semibold text-white">Activepieces Cloud</span>
          </div>
        </div>

        {/* Right Action Hub */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/command-center"
            className="inline-flex items-center gap-2 rounded-xl bg-[#eaf79f] text-black px-3.5 py-1.5 text-xs sm:text-sm font-semibold hover:bg-white transition shadow-sm"
          >
            <Terminal className="size-3.5 sm:size-4" />
            <span className="hidden sm:inline">AI Command Center</span>
            <span className="sm:hidden">Command</span>
          </Link>

          <Link
            href="/settings"
            title="Settings"
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <Settings className="size-4 sm:size-5" />
          </Link>

          <Link
            href="/profile"
            title="Profile & Settings"
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-xs"
          >
            <CircleUserRound className="size-4 sm:size-5 text-[#eaf79f]" />
            <span className="hidden md:inline font-medium text-white/90 max-w-32 truncate">
              Reality Design
            </span>
          </Link>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-16 bottom-0 left-0 z-50 md:z-30 w-72 bg-[#121413] border-r border-white/10 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile close button */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10">
            <span className="font-semibold text-sm">Navigation Menu</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-lg text-white/70 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Navigation Links Scrollable */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
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
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-[#eaf79f] text-black font-semibold shadow-sm'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
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

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-white/10 bg-[#0e100f]/60 space-y-2">
            <div className="flex items-center justify-between px-2 py-1.5 text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400" /> System Healthy
              </span>
              <span className="text-[10px] font-mono text-white/40">v2.4.0-TROS</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="size-3.5" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-[#0a0c0b] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
