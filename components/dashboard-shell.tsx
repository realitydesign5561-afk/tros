'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Activity, Bot, Boxes, ChevronRight, CircleUserRound, Database, Gauge, Globe2, LayoutGrid, LogOut, Megaphone, Settings, Sparkles, Workflow, Video } from 'lucide-react'

const navigation = [
  { label: 'Dashboard', href: '/', icon: Gauge },
  { label: 'Website Factory', href: '/website-factory', icon: Globe2 },
  { label: 'Workflow Builder', href: '/workflow-builder', icon: Workflow },
  { label: 'Social OS', href: '/social-os', icon: Megaphone },
  { label: 'Course Studio', href: '/course-studio', icon: Boxes },
  { label: 'YouTube OS', href: '/youtube-os', icon: Video },
  { label: 'AI Designer', href: '/ai-designer', icon: Sparkles },
  { label: 'Lead Gen', href: '/lead-gen', icon: Activity },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border bg-sidebar md:flex">
        <div className="flex h-20 items-center gap-3 border-b border-border px-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Bot className="size-5" /></div>
          <div><p className="font-semibold tracking-tight">TROS</p><p className="text-[11px] text-muted-foreground">Reality Operation System</p></div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = pathname === href
            return <Link key={href} href={href} className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}><Icon className="size-4" /><span>{label}</span>{active && <ChevronRight className="ml-auto size-3.5" />}</Link>
          })}
          <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">System</p>
          <Link href="/admin" className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${pathname === '/admin' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}><Database className="size-4" />Admin</Link>
          <Link href="/settings" className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${pathname === '/settings' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}><Settings className="size-4" />Settings</Link>
        </nav>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3"><CircleUserRound className="size-8 text-muted-foreground" /><div className="min-w-0"><p className="truncate text-sm font-medium">Admin</p><p className="truncate text-xs text-muted-foreground">admin@reality.com</p></div></div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="mt-3 flex w-full items-center gap-2 px-2 text-xs text-muted-foreground hover:text-foreground"><LogOut className="size-3.5" />Sign out</button>
        </div>
      </aside>
      <div className="md:pl-64"><header className="flex h-20 items-center justify-between border-b border-border px-6 md:px-10"><div><p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Operations center</p><h1 className="mt-1 text-lg font-semibold tracking-tight">{pathname === '/' ? 'Dashboard' : pathname.slice(1).replaceAll('-', ' ')}</h1></div><div className="flex items-center gap-3"><span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span className="size-2 rounded-full bg-emerald-500" />System operational</span><div className="flex size-9 items-center justify-center rounded-full border border-border bg-accent"><CircleUserRound className="size-4 text-muted-foreground" /></div></div></header><main className="mx-auto max-w-7xl p-6 md:p-10">{children}</main></div>
    </div>
  )
}
