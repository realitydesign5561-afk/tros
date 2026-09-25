import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'
import { AiStatusCenter } from '@/components/ai-status-center'

export default function AutomationPage() {
  return <AuthGuard><DashboardShell><AiStatusCenter /></DashboardShell></AuthGuard>
}
