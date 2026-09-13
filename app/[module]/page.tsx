import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const session = await getServerSession(authOptions); if (!session) redirect('/login')
  const { module } = await params
  const title = module.replaceAll('-', ' ')
  return <AuthGuard><DashboardShell><div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-border text-center"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">TROS module</p><h2 className="mt-3 text-3xl font-semibold capitalize tracking-tight">{title}</h2><p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">This workspace is ready for your next module. Build capabilities here without changing the TROS foundation.</p></div></DashboardShell></AuthGuard>
}
