'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Activity, Bot, Boxes, ChevronRight, CircleUserRound, Database, Gauge, Globe2, LogOut, Megaphone, Menu, Settings, ShieldCheck, Sparkles, Workflow, Video, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { InstallApp } from '@/components/install-app'
import { ThemeToggle } from '@/components/theme-toggle'

const navigation = [
  { label: 'Dashboard', href: '/', icon: Gauge },
  { label: 'Website Factory', href: '/website-factory', icon: Globe2 },
  { label: 'Workflow Builder', href: '/workflows', icon: Workflow },
  { label: 'Social OS', href: '/social/calendar', icon: Megaphone },
  { label: 'Course Studio', href: '/courses', icon: Boxes },
  { label: 'YouTube OS', href: '/youtube-os', icon: Video },
  { label: 'AI Designer', href: '/designer', icon: Sparkles },
  { label: 'Lead Gen', href: '/leads', icon: Activity },
  { label: 'Automation', href: '/automation', icon: Bot },
  { label: 'AI Features', href: '/ai-features', icon: Wand2 },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const currentLabel = pathname === '/' ? 'Managing Your Team and Workflows' : (pathname ?? '').slice(1).split('/')[0].replaceAll('-', ' ')
  
  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="relative flex w-full max-w-[1600px] h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] rounded-[2.5rem] bg-background text-foreground shadow-2xl overflow-hidden">
        
        {/* Mobile menu overlay */}
        {menuOpen && <button aria-label="Close navigation" className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setMenuOpen(false)} />}
        
        {/* Dark Sidebar Pill */}
        <aside className={`absolute md:relative left-4 top-4 bottom-4 z-50 flex w-[5.5rem] flex-col rounded-[2rem] bg-[#1a1c1a] text-white shadow-xl transition-transform md:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-[150%] md:translate-x-0'}`}>
          <div className="flex h-20 items-center justify-center pt-4">
            <div className="flex size-12 items-center justify-center rounded-full border-2 border-white/20"><Bot className="size-5" /></div>
          </div>
          
          <nav className="flex-1 space-y-4 px-3 py-8 flex flex-col items-center overflow-y-auto no-scrollbar">
            {navigation.map(({ label, href, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link prefetch={true} key={href} href={href} title={label} className={`group flex size-12 items-center justify-center rounded-full transition-colors ${active ? 'bg-[#3b3c3b] text-white' : 'text-white/50 hover:bg-[#2a2c2a] hover:text-white'}`}>
                  <Icon className="size-5" />
                </Link>
              )
            })}
          </nav>
          
          <div className="p-4 flex flex-col items-center gap-4 pb-6">
            <Link href="/settings" title="Settings" className={`flex size-12 items-center justify-center rounded-full transition-colors ${pathname === '/settings' ? 'bg-[#3b3c3b] text-white' : 'text-white/50 hover:bg-[#2a2c2a] hover:text-white'}`}>
              <Settings className="size-5" />
            </Link>
            <button onClick={() => signOut({ callbackUrl: '/login' })} title="Sign out" className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
              <CircleUserRound className="size-6" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pl-4 md:pl-8 overflow-hidden rounded-r-[2.5rem]">
          {/* Header */}
          <header className="flex h-24 shrink-0 items-center justify-between pr-8 pt-4">
            <div className="flex min-w-0 items-center gap-4">
              <button type="button" aria-label="Open navigation" onClick={() => setMenuOpen(true)} className="flex size-10 items-center justify-center rounded-full border border-border bg-card md:hidden">
                <Menu className="size-4" />
              </button>
              <h1 className="truncate text-3xl font-medium tracking-tight md:text-4xl flex items-center gap-3">
                {pathname === '/' ? (
                  <>Managing <Sparkles className="size-8 text-secondary fill-secondary" /> Your Team <br /> and Workflows</>
                ) : (
                  <span className="capitalize">{currentLabel}</span>
                )}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden size-12 items-center justify-center rounded-full border border-border bg-card shadow-sm sm:flex">
                <Settings className="size-5 text-muted-foreground" />
              </div>
              <Link href="/workflows" className="hidden items-center gap-2 rounded-full bg-[#1a1c1a] px-6 py-3 text-sm font-medium text-white transition hover:bg-black sm:flex">
                <span className="text-xl leading-none">+</span> Create a New Scenario
              </Link>
            </div>
          </header>

          {/* Main Scrollable Content */}
          <main className="flex-1 overflow-y-auto pr-8 pb-8 pt-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
