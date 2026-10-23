import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  generateOrAnimateVideoWithOmniFlash,
  generateSpeechTTS,
  generateOrEditImageWithNanoBanana,
} from '@/lib/gemini'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { assetType, lessonId, prompt, voiceName = 'Kore', aspectRatio = '16:9' } = body

  const course = await prisma.course.findUnique({
    where: { id: params.id },
  })

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  try {
    // 1. Text-to-Speech Voiceover (gemini-3.8-flash-lite-tts)
    if (assetType === 'VOICEOVER') {
      const textToSpeak = prompt || 'Welcome to this lesson in modern web design with artificial intelligence.'
      const result = await generateSpeechTTS({
        text: textToSpeak,
        voiceName: voiceName as any,
      })

      if (lessonId && result.audioUrl) {
        await prisma.lesson.update({
          where: { id: lessonId },
          data: {
            audioUrl: result.audioUrl,
          },
        })
      }

      return NextResponse.json({
        success: true,
        assetType: 'VOICEOVER',
        audioUrl: result.audioUrl,
        voiceName,
        model: result.model,
      })
    }

    // 2. Video Production with gemini-omni-1.1-flash via Interactions API
    if (assetType === 'VIDEO') {
      const videoPrompt =
        prompt ||
        `High-quality instructional video demonstration showing modern web design techniques and UI layouts for ${course.title}. Clean typography, sleek animations, and responsive screen viewports.`

      const result = await generateOrAnimateVideoWithOmniFlash({
        prompt: videoPrompt,
        aspectRatio: (aspectRatio as '16:9' | '9:16') || '16:9',
        duration: '5s',
        resolution: '720p',
      })

      if (lessonId && result.videoUrl) {
        await prisma.lesson.update({
          where: { id: lessonId },
          data: {
            videoUrl: result.videoUrl,
            videoStatus: 'READY',
          },
        })
      }

      return NextResponse.json({
        success: result.success,
        assetType: 'VIDEO',
        videoUrl: result.videoUrl,
        interactionId: result.interactionId,
        model: result.model,
      })
    }

    // 3. Course Cover Artwork with gemini-nano-banana-2.1
    if (assetType === 'COVER_ART') {
      const imagePrompt =
        prompt ||
        `Masterclass cover banner for an online course titled "${course.title}". Modern dark-mode aesthetic with neon lime accents, geometric 3D shapes, typography, and professional agency lighting.`

      const result = await generateOrEditImageWithNanoBanana({
        prompt: imagePrompt,
        aspectRatio: '16:9',
        imageSize: '2K',
      })

      if (result.imageUrl) {
        await prisma.course.update({
          where: { id: params.id },
          data: {
            coverImageUrl: result.imageUrl,
          },
        })
      }

      return NextResponse.json({
        success: result.success,
        assetType: 'COVER_ART',
        imageUrl: result.imageUrl,
        model: result.model,
      })
    }

    return NextResponse.json(
      { error: 'Invalid assetType. Choose VOICEOVER, VIDEO, or COVER_ART.' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Course asset generation error:', error)
    return NextResponse.json(
      { error: error?.message || 'Asset generation failed.' },
      { status: 500 }
    )
  }
}
