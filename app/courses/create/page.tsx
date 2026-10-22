import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'
import { CourseStudio } from '@/components/course-studio'

export default function CreateCoursePage() {
  return (
    <AuthGuard>
      <DashboardShell>
        <CourseStudio createMode />
      </DashboardShell>
    </AuthGuard>
  )
}

export const metadata = { title: 'Create course | TROS', description: 'Generate a course outline with AI.' }
