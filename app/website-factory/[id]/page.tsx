import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'
import { ProjectOperations } from '@/components/project-operations'

export default async function FactoryProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const { id } = await params
  const project = await prisma.project.findFirst({
    where: { id, ownerId: session.user.id },
    include: { managementLogs: { orderBy: { createdAt: 'desc' }, take: 5 } },
  })
  if (!project) notFound()

  return <AuthGuard><DashboardShell><div className="space-y-8">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Client project</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">{project.name}</h2><p className="mt-2 text-sm text-muted-foreground">{project.niche || 'Generated website'} · {project.status}</p></div><span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-400">{project.health === 'UNKNOWN' ? 'Awaiting deployment' : project.health}</span></div>
    <div className="grid gap-4 md:grid-cols-3"><Metric label="Deployment" value={project.deploymentUrl || 'Not connected'} /><Metric label="Repository" value={project.repositoryUrl || 'Not connected'} /><Metric label="Domain" value={project.domain || 'Not connected'} /></div>
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><section className="rounded-xl border border-border bg-card p-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Generated blueprint</p><pre className="mt-5 max-h-[480px] overflow-auto whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{project.blueprint}</pre></section><section className="rounded-xl border border-border bg-card p-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Management activity</p><p className="mt-3 text-sm leading-6 text-muted-foreground">Retainer, maintenance, deployment, domain, and billing activity is tracked in SQLite.</p><div className="mt-6 space-y-3">{project.managementLogs.length ? project.managementLogs.map((log) => <div key={log.id} className="border-b border-border pb-3"><p className="text-sm font-medium">{log.title}</p><p className="text-xs text-muted-foreground">{log.type}</p></div>) : <p className="rounded-lg bg-accent/50 p-4 text-sm text-muted-foreground">No management activity yet.</p>}</div></section></div>
    <ProjectOperations projectId={project.id} />
  </div></DashboardShell></AuthGuard>
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p><p className="mt-3 truncate text-sm font-medium">{value}</p></div> }
