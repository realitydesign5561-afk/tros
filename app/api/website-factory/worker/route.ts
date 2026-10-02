import { NextResponse } from 'next/server'
import { claimWebsiteBuild, runWebsiteBuild } from '@/lib/website-factory/pipeline'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const secret = process.env.WEBSITE_WORKER_SECRET || process.env.AGENT_WORKER_SECRET || process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const build = await claimWebsiteBuild()
  if (!build) return NextResponse.json({ claimed: false, message: 'No queued website builds.' })
  const result = await runWebsiteBuild(build.id, true)
  return NextResponse.json({ claimed: true, buildId: build.id, result })
}

export async function POST(request: Request) { return GET(request) }
