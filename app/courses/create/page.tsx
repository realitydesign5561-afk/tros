import { DashboardShell } from '@/components/dashboard-shell'
import { CourseStudio } from '@/components/course-studio'

export default function CreateCoursePage() { return <DashboardShell><CourseStudio createMode /></DashboardShell> }

export const metadata = { title: 'Create course | TROS', description: 'Generate a course outline with AI.' }
