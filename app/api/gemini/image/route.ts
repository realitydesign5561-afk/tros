import { NextRequest, NextResponse } from 'next/server'
import { generateOrEditImageWithNanoBanana } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      prompt,
      referenceImageBase64,
      referenceMimeType,
      aspectRatio = '1:1',
      imageSize = '1K',
      enableSearchGrounding = false,
    } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const result = await generateOrEditImageWithNanoBanana({
      prompt,
      referenceImageBase64,
      referenceMimeType,
      aspectRatio,
      imageSize,
      enableSearchGrounding,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Gemini image generation error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate/edit image with gemini-nano-banana-2.1' },
      { status: 500 }
    )
  }
}
