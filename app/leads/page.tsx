import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LeadsCrm } from '@/components/leads-crm'
import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'

export default async function LeadsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  const leads = await prisma.lead.findMany({ where: { ownerId: session.user.id }, orderBy: { updatedAt: 'desc' } })
  return <AuthGuard><DashboardShell><LeadsCrm initialLeads={leads} /></DashboardShell></AuthGuard>
}
