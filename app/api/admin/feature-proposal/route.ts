import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { prompt } = await request.json()
  if (typeof prompt !== 'string' || prompt.trim().length < 3) return NextResponse.json({ error: 'Describe the feature first.' }, { status: 400 })
  const name = prompt.trim().replace(/^add\s+/i, '').replace(/\s+/g, ' ')
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return NextResponse.json({ proposal: { title: name.replace(/\b\w/g, (letter) => letter.toUpperCase()), slug, page: `/${slug}`, table: slug.replaceAll('-', '_'), api: `/api/${slug}`, sidebar: name.replace(/\b\w/g, (letter) => letter.toUpperCase()), steps: ['Review the generated data model', 'Confirm the API contract', 'Apply the page and sidebar link'] } })
}
