import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'
import { AutomationControlPlane } from '@/components/automation-control-plane'

export default function AutomationPage() {
  return <AuthGuard><DashboardShell><AutomationControlPlane /></DashboardShell></AuthGuard>
}
