import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeAITask } from '@/lib/ai-gateway/service'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { niche, message, mode = 'caption', platform = 'linkedin' } = await request.json()
  const platformGuidance = platform === 'linkedin' ? 'Write a thoughtful LinkedIn post with a useful problem-solving insight, a practical framework, a conversational question, and no hard-sell language. Invite discussion from potential customers and peers.' : `Write a native ${platform} post with a useful solution, natural conversation prompt, and platform-appropriate length.`
  const prompt = mode === 'reply' ? `Draft a concise, warm reply to this ${platform} social message: ${message}` : `${platformGuidance} Topic or niche: ${niche}. Create a fresh post and 5 relevant hashtags. Return the post first, then hashtags.`
  try {
    const result = await executeAITask({ task: prompt, capability: 'TEXT_GENERATION', userId: session.user.id, maxTokens: 240 })
    return NextResponse.json({ text: typeof result.output === 'string' ? result.output : '', taskId: result.taskId, provider: result.providerName, model: result.model })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'AI generation unavailable' }, { status: 503 }) }
}
