import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { gateway } from '@ai-sdk/gateway'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const { niche, message, mode = 'caption', platform = 'linkedin' } = await request.json()
  const platformGuidance = platform === 'linkedin' ? 'Write a thoughtful LinkedIn post with a useful problem-solving insight, a practical framework, a conversational question, and no hard-sell language. Invite discussion from potential customers and peers.' : `Write a native ${platform} post with a useful solution, natural conversation prompt, and platform-appropriate length.`
  const prompt = mode === 'reply' ? `Draft a concise, warm reply to this ${platform} social message: ${message}` : `${platformGuidance} Topic or niche: ${niche}. Create a fresh post and 5 relevant hashtags. Return the post first, then hashtags.`
  if (!process.env.AI_GATEWAY_API_KEY) return NextResponse.json({ text: mode === 'reply' ? `Thanks for sharing this — I appreciate your perspective. What has worked best for you?` : `${platform === 'linkedin' ? 'A useful way to solve this is to make the next step clear, practical, and easy to test. What would you add to this approach?' : `A practical idea for ${niche}: make the next step simple, useful, and easy to share.`}\n\n#${String(niche || 'creator').replace(/\s+/g, '')} #content #growth #community #tips`, fallback: true })
  try {
    const result = await generateText({ model: gateway('openai/gpt-4o-mini'), prompt, maxOutputTokens: 240 })
    return NextResponse.json({ text: result.text })
  } catch { return NextResponse.json({ error: 'AI generation unavailable' }, { status: 503 }) }
}
