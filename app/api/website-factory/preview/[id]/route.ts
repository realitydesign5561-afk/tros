import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id }
  })

  if (!project) {
    return new NextResponse('Project not found', { status: 404 })
  }

  if (project.status === 'ERROR') {
    return new NextResponse(`Project generation failed: ${project.health}`, { status: 500 })
  }

  if (!project.blueprint) {
    return new NextResponse(`
      <html>
        <head><title>Building...</title></head>
        <body style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif;">
          <h1>Building website... (Status: ${project.status})</h1>
          <script>setTimeout(() => window.location.reload(), 3000)</script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })
  }

  return new NextResponse(project.blueprint, {
    headers: {
      'Content-Type': 'text/html',
      // Allow it to be embedded in an iframe in the dashboard
      'X-Frame-Options': 'ALLOWALL',
    }
  })
}
