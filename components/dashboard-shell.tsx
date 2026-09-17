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
  const currentLabel = pathname === '/' ? 'Dashboard' : (pathname ?? '').slice(1).split('/')[0].replaceAll('-', ' ')
  return (
    <div className="min-h-screen bg-background text-foreground">
      {menuOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[min(84vw,19rem)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl transition-transform md:w-72 md:translate-x-0 md:shadow-none ${menuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex h-24 items-center gap-3 border-b border-sidebar-border px-7">
          <div className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-black/10"><Bot className="size-5" /></div>
          <div><p className="font-mono text-sm font-medium tracking-[0.18em]">TROS / 01</p><p className="mt-1 text-[11px] text-sidebar-foreground/60">Reality operations system</p></div>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-7">
          <p className="mb-4 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/45">Workspace</p>
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = pathname === href
            return <Link prefetch={true} key={href} href={href} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-black/10' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}><Icon className="size-4" /><span>{label}</span>{active && <ChevronRight className="ml-auto size-3.5" />}</Link>
          })}
          <p className="mb-4 mt-10 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/45">System</p>
          <Link href="/admin" className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${pathname === '/admin' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}><Database className="size-4" />Admin</Link>
          <Link href="/settings" className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${pathname === '/settings' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}><Settings className="size-4" />Settings</Link>
          <Link href="/test-lab" className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${pathname === '/test-lab' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}><ShieldCheck className="size-4" />Test lab</Link>
        </nav>
        <div className="border-t border-sidebar-border p-5">
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent p-3"><CircleUserRound className="size-8 text-sidebar-foreground/70" /><div className="min-w-0"><p className="truncate text-sm font-medium">Admin</p><p className="truncate text-xs text-sidebar-foreground/50">admin@reality.com</p></div></div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="mt-4 flex w-full items-center gap-2 px-2 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground"><LogOut className="size-3.5" />Sign out</button>
        </div>
      </aside>
      <div className="md:pl-72"><header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-border/80 bg-background/80 px-4 backdrop-blur-xl md:px-10"><div className="flex min-w-0 items-center gap-3"><button type="button" aria-label="Open navigation" onClick={() => setMenuOpen(true)} className="flex size-10 items-center justify-center rounded-xl border border-border bg-card md:hidden"><Menu className="size-4" /></button><div className="min-w-0"><p className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">Operations center / 2026</p><h1 className="truncate text-lg font-bold capitalize tracking-tight md:mt-1 md:text-xl">{currentLabel}</h1></div></div><div className="flex items-center gap-2"><span className="hidden items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-700 lg:flex"><span className="size-2 rounded-full bg-emerald-500" />All systems operational</span><InstallApp /><ThemeToggle /><div className="hidden size-10 items-center justify-center rounded-full border border-border bg-card sm:flex"><CircleUserRound className="size-4 text-muted-foreground" /></div></div></header><main className="mx-auto max-w-[1440px] p-4 pb-24 sm:p-6 md:p-10 md:pb-10">{children}</main><nav className="fixed inset-x-3 bottom-3 z-20 flex items-center justify-around rounded-2xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur md:hidden">{navigation.slice(0, 5).map(({ label, href, icon: Icon }) => <Link key={href} href={href} aria-label={label} className={`flex size-11 items-center justify-center rounded-xl ${pathname === href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><Icon className="size-4" /></Link>)}</nav></div>
    </div>
  )
}
