import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeAITask } from '@/lib/ai-gateway/service'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as { prompt?: string }
  const prompt = String(body.prompt || '').trim()
  if (!prompt) return NextResponse.json({ error: 'Describe the visual first.' }, { status: 400 })
  try {
    const result = await executeAITask({ task: prompt, capability: 'IMAGE_GENERATION', userId: session.user.id, imageSize: '1024x1024', fallbackPolicy: { maxAttempts: 1 } })
    const image = typeof result.output === 'object' ? result.output.url : ''
    return NextResponse.json({ imageUrl: image, taskId: result.taskId, provider: result.providerName, model: result.model })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Image generation failed.' }, { status: 502 })
  }
}
