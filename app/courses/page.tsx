import { DashboardShell } from '@/components/dashboard-shell'
import { CourseStudio } from '@/components/course-studio'

export default function CoursesPage() { return <DashboardShell><CourseStudio /></DashboardShell> }

export const metadata = { title: 'Courses | TROS', description: 'Create and operate AI-assisted courses.' }

export const dynamic = 'force-dynamic'

