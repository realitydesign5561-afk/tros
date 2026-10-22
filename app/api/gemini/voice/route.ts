import { NextRequest, NextResponse } from 'next/server'
import { generateSpeechTTS } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text, voiceName = 'Kore' } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const result = await generateSpeechTTS({ text, voiceName })
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Gemini voice TTS error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to synthesize speech with gemini-3.8-flash-lite-tts' },
      { status: 500 }
    )
  }
}
