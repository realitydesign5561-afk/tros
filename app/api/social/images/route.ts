import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as { prompt?: string }
  const prompt = String(body.prompt || '').trim()
  if (!prompt) return NextResponse.json({ error: 'Describe the visual first.' }, { status: 400 })
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 503 })

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '1024x1024', quality: 'medium' }),
  })
  const data = await response.json() as { data?: { url?: string; b64_json?: string }[]; error?: { message?: string } }
  if (!response.ok) return NextResponse.json({ error: data.error?.message || 'Image generation failed.' }, { status: 502 })
  const image = data.data?.[0]
  if (!image?.url && !image?.b64_json) return NextResponse.json({ error: 'Image provider returned no image.' }, { status: 502 })
  return NextResponse.json({ imageUrl: image.url || `data:image/png;base64,${image.b64_json}` })
}
