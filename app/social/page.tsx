import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'
import { SocialOS } from '@/components/social-os'
export default function SocialPage() { return <AuthGuard><DashboardShell><SocialOS /></DashboardShell></AuthGuard> }
