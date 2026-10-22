import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudioWithGemini } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { base64Audio, mimeType = 'audio/webm', prompt } = body

    if (!base64Audio || typeof base64Audio !== 'string') {
      return NextResponse.json({ error: 'base64Audio is required' }, { status: 400 })
    }

    const result = await transcribeAudioWithGemini({
      base64Audio,
      mimeType,
      prompt,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Gemini transcription error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to transcribe audio with gemini-3.5-transcribe' },
      { status: 500 }
    )
  }
}
