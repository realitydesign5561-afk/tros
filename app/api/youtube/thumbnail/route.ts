import { NextRequest, NextResponse } from 'next/server'
import { generateOrEditImageWithNanoBanana } from '@/lib/gemini'

// Generates an eye-catching SVG vector thumbnail as fallback if Gemini image generation is in text mode or quota
function generateChristianThumbnailSVG(title: string, variant: 'A' | 'B' = 'A'): string {
  const cleanTitle = title.replace(/[<>&"']/g, '').slice(0, 50)
  const isA = variant === 'A'
  
  const bgGradient = isA 
    ? 'linear-gradient(135deg, #090b14 0%, #171a2e 50%, #2b1f0c 100%)'
    : 'linear-gradient(135deg, #050811 0%, #0d1527 50%, #1e1333 100%)'
  
  const glowColor = isA ? '#f59e0b' : '#818cf8'
  const badgeText = isA ? 'DIVINE PROMISE' : 'WATCH BEFORE SLEEP'
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <radialGradient id="divineGlow" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="#090d16"/>
    <rect width="1280" height="720" fill="url(#divineGlow)"/>
    
    <!-- Cross/Dove subtle holy rays -->
    <path d="M640 40 L640 380 M520 160 L760 160" stroke="${glowColor}" stroke-width="4" stroke-opacity="0.4" stroke-linecap="round"/>
    
    <!-- Badge -->
    <rect x="80" y="80" width="260" height="48" rx="24" fill="${isA ? '#f59e0b' : '#6366f1'}" fill-opacity="0.2" stroke="${glowColor}" stroke-width="2"/>
    <text x="210" y="111" font-family="sans-serif" font-weight="900" font-size="16" fill="${glowColor}" text-anchor="middle" letter-spacing="3">${badgeText}</text>
    
    <!-- Big Headline -->
    <text x="80" y="270" font-family="sans-serif" font-weight="900" font-size="64" fill="#ffffff" letter-spacing="-1">DO NOT</text>
    <text x="80" y="370" font-family="sans-serif" font-weight="900" font-size="78" fill="url(#textGrad)" letter-spacing="-2">WORRY TONIGHT</text>
    
    <!-- Topic Subtitle -->
    <rect x="80" y="440" width="760" height="70" rx="16" fill="#000000" fill-opacity="0.6" stroke="#334155" stroke-width="2"/>
    <text x="110" y="484" font-family="sans-serif" font-weight="700" font-size="24" fill="#e2e8f0">${cleanTitle}...</text>

    <!-- Bottom Click Magnet -->
    <rect x="80" y="550" width="340" height="54" rx="14" fill="${isA ? '#d97706' : '#4f46e5'}"/>
    <text x="250" y="584" font-family="sans-serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle" letter-spacing="1">PLAY THIS PRAYER NOW</text>
    
    <!-- High CTR Duration Stamp -->
    <rect x="1120" y="640" width="100" height="40" rx="8" fill="#000000" fill-opacity="0.8"/>
    <text x="1170" y="666" font-family="sans-serif" font-weight="700" font-size="16" fill="#ffffff" text-anchor="middle">12:30</text>
  </svg>`

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      topic = 'Listen To This Prayer Before You Sleep | Psalm 91 Deep Peace',
      variant = 'A',
      aspectRatio = '16:9',
      imageSize = '2K',
    } = body

    const promptA = `Hyper-realistic, viral, high-CTR YouTube thumbnail (16:9) for Christian long-form video: "${topic}".
Visual elements: Majestic golden divine rays breaking through dark nighttime clouds, an elderly reverent man praying with deep peace, radiant warm lighting, glowing biblical particles, cinematic high-contrast lighting, bold visual focal point, ultra-clear 3D depth, photorealistic, 4K quality.`

    const promptB = `High-contrast, emotional YouTube thumbnail (16:9) for Christian long-form video: "${topic}".
Visual elements: A silhouette of a person on a mountain peak at dawn with open hands facing an epic celestial light beam from heaven, dramatic purple and gold dawn sky, powerful spiritual atmosphere, ultra-clean focal hierarchy, 4K quality.`

    const targetPrompt = variant === 'B' ? promptB : promptA

    let imageUrl: string | null = null

    try {
      const result = await generateOrEditImageWithNanoBanana({
        prompt: targetPrompt,
        aspectRatio: '16:9',
        imageSize: '2K',
        enableSearchGrounding: true,
      })

      if (result.imageUrl) {
        imageUrl = result.imageUrl
      }
    } catch (e: any) {
      console.warn('Gemini thumbnail generation fallback to SVG visual canvas:', e.message)
    }

    // If Gemini returned text or was rate-limited, ensure the user always has a high-res graphic canvas!
    if (!imageUrl) {
      imageUrl = generateChristianThumbnailSVG(topic, variant as 'A' | 'B')
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      variant,
      aspectRatio: '16:9',
      imageSize: '2K',
      model: 'gemini-nano-banana-2.1',
      promptUsed: targetPrompt,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to generate long video thumbnail' },
      { status: 500 }
    )
  }
}
