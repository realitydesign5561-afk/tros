import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'
import { YouTubeOS } from '@/components/youtube-os'

export default function YouTubeOSPage() {
  return (
    <AuthGuard>
      <DashboardShell>
        <YouTubeOS />
      </DashboardShell>
    </AuthGuard>
  )
}
