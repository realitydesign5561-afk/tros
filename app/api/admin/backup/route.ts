import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const file = await readFile(path.join(process.cwd(), 'prisma', 'dev.db'))
    return new Response(file, { headers: { 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename="tros-backup.db"', 'X-Google-Drive-Status': 'not-connected' } })
  } catch { return NextResponse.json({ error: 'SQLite backup is not available in this environment.' }, { status: 404 }) }
}
