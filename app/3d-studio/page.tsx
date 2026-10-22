'use client'

import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'
import { ThreeSceneStudio } from '@/components/three-scene'

export default function ThreeStudioPage() {
  return (
    <AuthGuard>
      <DashboardShell>
        <ThreeSceneStudio />
      </DashboardShell>
    </AuthGuard>
  )
}
