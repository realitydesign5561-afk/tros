import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LeadsCrm } from '@/components/leads-crm'

export default async function LeadsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  const leads = await prisma.lead.findMany({ where: { ownerId: session.user.id }, orderBy: { updatedAt: 'desc' } })
  return <LeadsCrm initialLeads={leads} />
}
