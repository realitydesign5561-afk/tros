import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'
import { ProjectOperations } from '@/components/project-operations'
import { WebsitePreviewStudio } from '@/components/website-preview-studio'

export default async function FactoryProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const { id } = await params
  const project = await prisma.project.findFirst({
    where: { id, ownerId: session.user.id },
    include: { managementLogs: { orderBy: { createdAt: 'desc' }, take: 5 } },
  })
  if (!project) notFound()

  return (
    <AuthGuard>
      <DashboardShell>
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                Website Factory Studio
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">{project.name}</h2>
              <p className="mt-1 text-sm text-white/60">
                {project.niche || 'Generated Website'} · {project.status}
              </p>
            </div>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400">
              {project.health === 'UNKNOWN' ? 'Scaffolding Ready' : project.health}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Metric label="Deployment" value={project.deploymentUrl || 'Preview Sandbox Active'} />
            <Metric label="Repository" value={project.repositoryUrl || 'Local Git Worktree'} />
            <Metric label="Domain" value={project.domain || 'Auto-assigned edge subdomain'} />
          </div>

          {/* Interactive Live Preview Studio */}
          <WebsitePreviewStudio
            projectId={project.id}
            projectName={project.name}
            blueprint={project.blueprint || '<!-- Scaffolding HTML -->' }
            status={project.status}
            deploymentUrl={project.deploymentUrl}
            domain={project.domain}
            repositoryUrl={project.repositoryUrl}
          />

          {/* Vercel & GitHub Operations */}
          <ProjectOperations projectId={project.id} />
        </div>
      </DashboardShell>
    </AuthGuard>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#141615] p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">{label}</p>
      <p className="mt-2 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  )
}
