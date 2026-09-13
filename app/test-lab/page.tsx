import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'
import { AutomationControlPlane } from '@/components/automation-control-plane'

export default function TestLabPage() {
  return <AuthGuard><DashboardShell><div className="mb-6"><h2 className="text-2xl font-semibold tracking-tight">Test lab</h2><p className="mt-2 text-sm text-muted-foreground">Safely test provider connections, prompts, workflow repairs, and publishing queues before activation.</p></div><AutomationControlPlane /></DashboardShell></AuthGuard>
}
