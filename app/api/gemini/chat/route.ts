import { NextRequest, NextResponse } from 'next/server'
import { chatWithGemini } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, modelTier = 'flash', systemInstruction } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required with at least one message' },
        { status: 400 }
      )
    }

    const result = await chatWithGemini({
      messages,
      modelTier,
      systemInstruction,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Gemini chat error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to complete chat interaction with Gemini' },
      { status: 500 }
    )
  }
}
