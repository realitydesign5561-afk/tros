import { NextRequest, NextResponse } from 'next/server'
import { queryWithGrounding } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, mode = 'search' } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (mode !== 'search' && mode !== 'maps') {
      return NextResponse.json({ error: "Mode must be either 'search' or 'maps'" }, { status: 400 })
    }

    const result = await queryWithGrounding({
      prompt,
      mode,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Gemini grounding query error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to complete grounded query with Gemini' },
      { status: 500 }
    )
  }
}
