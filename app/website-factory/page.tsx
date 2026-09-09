import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'
import { WebsiteFactory } from '@/components/website-factory'

export default async function WebsiteFactoryPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  return <AuthGuard><DashboardShell><WebsiteFactory /></DashboardShell></AuthGuard>
}
