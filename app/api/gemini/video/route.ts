import { NextRequest, NextResponse } from 'next/server'
import { generateOrAnimateVideoWithOmniFlash } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      prompt,
      referenceImageBase64,
      referenceMimeType,
      aspectRatio = '16:9',
      duration = '5s',
      resolution = '720p',
    } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const result = await generateOrAnimateVideoWithOmniFlash({
      prompt,
      referenceImageBase64,
      referenceMimeType,
      aspectRatio,
      duration,
      resolution,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Gemini video generation error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate video with gemini-omni-1.1-flash' },
      { status: 500 }
    )
  }
}
