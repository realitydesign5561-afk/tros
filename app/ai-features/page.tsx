import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'
import { AiFeatureStudio } from '@/components/ai-feature-studio'

export default function AiFeaturesPage() {
  return <AuthGuard><DashboardShell><AiFeatureStudio /></DashboardShell></AuthGuard>
}
