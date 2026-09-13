'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Activity, Bot, Boxes, ChevronRight, CircleUserRound, Database, Gauge, Globe2, LogOut, Megaphone, Menu, Settings, ShieldCheck, Sparkles, Workflow, Video } from 'lucide-react'
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
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const currentLabel = pathname === '/' ? 'Dashboard' : (pathname ?? '').slice(1).split('/')[0].replaceAll('-', ' ')
  return (
    <div className="min-h-screen bg-background text-foreground">
      {menuOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[min(84vw,18rem)] flex-col border-r border-border bg-sidebar shadow-2xl transition-transform md:w-64 md:translate-x-0 md:shadow-none ${menuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex h-20 items-center gap-3 border-b border-border px-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Bot className="size-5" /></div>
          <div><p className="font-semibold tracking-tight">TROS</p><p className="text-[11px] text-muted-foreground">Reality Operation System</p></div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = pathname === href
            return <Link prefetch={true} key={href} href={href} className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}><Icon className="size-4" /><span>{label}</span>{active && <ChevronRight className="ml-auto size-3.5" />}</Link>
          })}
          <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">System</p>
          <Link href="/admin" className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${pathname === '/admin' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}><Database className="size-4" />Admin</Link>
          <Link href="/settings" className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${pathname === '/settings' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}><Settings className="size-4" />Settings</Link>
          <Link href="/test-lab" className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${pathname === '/test-lab' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}><ShieldCheck className="size-4" />Test lab</Link>
        </nav>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3"><CircleUserRound className="size-8 text-muted-foreground" /><div className="min-w-0"><p className="truncate text-sm font-medium">Admin</p><p className="truncate text-xs text-muted-foreground">admin@reality.com</p></div></div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="mt-3 flex w-full items-center gap-2 px-2 text-xs text-muted-foreground hover:text-foreground"><LogOut className="size-3.5" />Sign out</button>
        </div>
      </aside>
      <div className="md:pl-64"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:h-20 md:px-10"><div className="flex min-w-0 items-center gap-3"><button type="button" aria-label="Open navigation" onClick={() => setMenuOpen(true)} className="flex size-9 items-center justify-center rounded-xl border border-border bg-card md:hidden"><Menu className="size-4" /></button><div className="min-w-0"><p className="hidden text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">Operations center</p><h1 className="truncate text-base font-semibold capitalize tracking-tight md:mt-1 md:text-lg">{currentLabel}</h1></div></div><div className="flex items-center gap-2"><span className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex"><span className="size-2 rounded-full bg-emerald-500" />System operational</span><InstallApp /><ThemeToggle /><div className="hidden size-9 items-center justify-center rounded-full border border-border bg-accent sm:flex"><CircleUserRound className="size-4 text-muted-foreground" /></div></div></header><main className="mx-auto max-w-7xl p-4 pb-24 sm:p-6 md:p-10 md:pb-10">{children}</main><nav className="fixed inset-x-3 bottom-3 z-20 flex items-center justify-around rounded-2xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur md:hidden">{navigation.slice(0, 5).map(({ label, href, icon: Icon }) => <Link key={href} href={href} aria-label={label} className={`flex size-11 items-center justify-center rounded-xl ${pathname === href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><Icon className="size-4" /></Link>)}</nav></div>
    </div>
  )
}
