import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'
import { SocialOS } from '@/components/social-os'
export default async function SocialViewPage({ params }: { params: Promise<{ view: string }> }) { const { view } = await params; return <AuthGuard><DashboardShell><SocialOS view={view} /></DashboardShell></AuthGuard> }
