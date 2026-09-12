import { DashboardShell } from '@/components/dashboard-shell'
import { AuthGuard } from '@/components/auth-guard'
import { AdminDashboard } from '@/components/admin-dashboard'

export default function AdminPage() {
  return <AuthGuard><DashboardShell><AdminDashboard /></DashboardShell></AuthGuard>
}
