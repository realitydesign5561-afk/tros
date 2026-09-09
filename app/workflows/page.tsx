import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'
import { WorkflowBuilder } from '@/components/workflow-builder'

export default function WorkflowsPage() {
  return <AuthGuard><DashboardShell><WorkflowBuilder /></DashboardShell></AuthGuard>
}
