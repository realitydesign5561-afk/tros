import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { gateway } from '@ai-sdk/gateway'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const { niche, message, mode = 'caption' } = await request.json()
  const prompt = mode === 'reply' ? `Draft a concise, warm reply to this social message: ${message}` : `Create a social media caption and 5 relevant hashtags for the niche: ${niche}. Return caption first, then hashtags.`
  if (!process.env.AI_GATEWAY_API_KEY) return NextResponse.json({ text: mode === 'reply' ? `Thanks for sharing this — I appreciate you reaching out. I'll follow up shortly.` : `A practical idea for ${niche}: make the next step simple, useful, and easy to share.\n\n#${String(niche || 'creator').replace(/\\s+/g, '')} #content #growth #community #tips`, fallback: true })
  try {
    const result = await generateText({ model: gateway('openai/gpt-4o-mini'), prompt, maxOutputTokens: 240 })
    return NextResponse.json({ text: result.text })
  } catch { return NextResponse.json({ error: 'AI generation unavailable' }, { status: 503 }) }
}
