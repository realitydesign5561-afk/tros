import { GoogleGenAI } from '@google/genai'

/**
 * Shared server-side Gemini client utility for TROS.
 * Adheres strictly to Gemini API & Interactions API skills:
 * - process.env.GEMINI_API_KEY server-only secret
 * - 'User-Agent': 'aistudio-build' telemetry header
 * - Interactions API for gemini-omni-1.1-flash video and managed agents
 * - generateContent for gemini-nano-banana-2.1, gemini-3.8-flash, gemini-4-argon, etc.
 */

let cachedClient: GoogleGenAI | null = null

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Please ensure GEMINI_API_KEY is present in your environment secrets.'
    )
  }

  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  }

  return cachedClient
}

/**
 * High-Quality Image Generation & Editing with gemini-nano-banana-2.1
 * Supports text-to-image and image-to-image editing, configurable aspect ratios and sizes.
 */
export async function generateOrEditImageWithNanoBanana(params: {
  prompt: string
  referenceImageBase64?: string
  referenceMimeType?: string
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '1:4' | '1:8' | '4:1' | '8:1'
  imageSize?: '1K' | '2K' | '4K'
  enableSearchGrounding?: boolean
}) {
  const ai = getGeminiClient()
  const {
    prompt,
    referenceImageBase64,
    referenceMimeType = 'image/png',
    aspectRatio = '1:1',
    imageSize = '1K',
    enableSearchGrounding = false,
  } = params

  const parts: any[] = []

  // If a reference image is provided, include it first for image editing
  if (referenceImageBase64) {
    parts.push({
      inlineData: {
        data: referenceImageBase64.replace(/^data:[^;]+;base64,/, ''),
        mimeType: referenceMimeType,
      },
    })
  }

  parts.push({ text: prompt })

  const config: any = {
    imageConfig: {
      aspectRatio,
      imageSize,
    },
  }

  if (enableSearchGrounding) {
    config.tools = [
      {
        googleSearch: {
          searchTypes: {
            webSearch: {},
            imageSearch: {},
          },
        },
      },
    ]
  }

  const response = await ai.models.generateContent({
    model: 'gemini-nano-banana-2.1',
    contents: { parts },
    config,
  })

  let outputBase64 = ''
  let outputMimeType = 'image/png'
  let textOutput = ''

  const candidates = response.candidates?.[0]?.content?.parts || []
  for (const part of candidates) {
    if (part.inlineData) {
      outputBase64 = part.inlineData.data
      if (part.inlineData.mimeType) {
        outputMimeType = part.inlineData.mimeType
      }
    } else if (part.text) {
      textOutput += part.text
    }
  }

  if (!outputBase64 && !textOutput) {
    textOutput = response.text || ''
  }

  return {
    success: Boolean(outputBase64),
    imageUrl: outputBase64 ? `data:${outputMimeType};base64,${outputBase64}` : null,
    base64Data: outputBase64,
    mimeType: outputMimeType,
    text: textOutput,
    model: 'gemini-nano-banana-2.1',
    aspectRatio,
    imageSize,
  }
}

/**
 * Text-to-Video & Image-to-Video (Animate Images) with gemini-omni-1.1-flash
 * Strictly uses the Interactions API (ai.interactions.create) as required by skill.
 */
export async function generateOrAnimateVideoWithOmniFlash(params: {
  prompt: string
  referenceImageBase64?: string
  referenceMimeType?: string
  aspectRatio?: '16:9' | '9:16'
  duration?: '5s' | '10s'
  resolution?: '720p' | '1080p' | '360p' | '4k'
}) {
  const ai = getGeminiClient()
  const {
    prompt,
    referenceImageBase64,
    referenceMimeType = 'image/png',
    aspectRatio = '16:9',
    duration = '5s',
    resolution = '720p',
  } = params

  let input: any

  if (referenceImageBase64) {
    // Image-to-Video (Animate Image)
    input = [
      {
        type: 'image',
        mime_type: referenceMimeType,
        data: referenceImageBase64.replace(/^data:[^;]+;base64,/, ''),
      },
      {
        type: 'text',
        text: prompt,
      },
    ]
  } else {
    // Text-to-Video
    input = prompt
  }

  const interaction = await ai.interactions.create(
    {
      model: 'gemini-omni-1.1-flash',
      input,
      background: false,
      store: false,
      stream: false,
      response_format: {
        type: 'video',
        aspect_ratio: aspectRatio,
        duration,
        resolution,
      },
    },
    { timeout: 300000 } // 5 minutes timeout
  )

  const videoPart = interaction.output_video
  let videoBase64 = ''
  let videoMimeType = 'video/mp4'

  if (videoPart?.data) {
    videoBase64 = videoPart.data
    videoMimeType = videoPart.mime_type || 'video/mp4'
  }

  return {
    success: Boolean(videoBase64),
    videoUrl: videoBase64 ? `data:${videoMimeType};base64,${videoBase64}` : null,
    base64Data: videoBase64,
    mimeType: videoMimeType,
    aspectRatio,
    duration,
    resolution,
    model: 'gemini-omni-1.1-flash',
    interactionId: interaction.id,
  }
}

/**
 * Multi-Turn Role-Based Chat with Gemini
 * Supports tier-based model selection:
 * - gemini-4-argon (Complex reasoning & deep logic)
 * - gemini-3.8-flash (General balanced tasks)
 * - gemini-3.1-flash-lite (Fastest response)
 */
export async function chatWithGemini(params: {
  messages: { role: 'user' | 'model' | 'system'; content: string }[]
  modelTier?: 'argon' | 'flash' | 'lite'
  systemInstruction?: string
}) {
  const ai = getGeminiClient()
  const { messages, modelTier = 'flash', systemInstruction } = params

  let modelName = 'gemini-3.8-flash'
  if (modelTier === 'argon') modelName = 'gemini-4-argon'
  if (modelTier === 'lite') modelName = 'gemini-3.1-flash-lite'

  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))

  const config: any = {}
  if (systemInstruction) {
    config.systemInstruction = systemInstruction
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents,
    config,
  })

  return {
    text: response.text || '',
    model: modelName,
    usage: response.usageMetadata,
  }
}

/**
 * Grounded Queries (Search Grounding & Maps Grounding) with gemini-3.8-flash
 */
export async function queryWithGrounding(params: {
  prompt: string
  mode: 'search' | 'maps'
}) {
  const ai = getGeminiClient()
  const { prompt, mode } = params

  const tools: any[] = mode === 'maps' ? [{ googleMaps: {} }] : [{ googleSearch: {} }]

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      tools,
    },
  })

  // Extract candidate groundings if present
  const candidate = response.candidates?.[0]
  const groundingMetadata = (candidate as any)?.groundingMetadata

  return {
    text: response.text || '',
    mode,
    model: 'gemini-3.8-flash',
    groundingMetadata,
  }
}

/**
 * Audio Transcription with gemini-3.5-transcribe
 */
export async function transcribeAudioWithGemini(params: {
  base64Audio: string
  mimeType?: string
  prompt?: string
}) {
  const ai = getGeminiClient()
  const {
    base64Audio,
    mimeType = 'audio/webm',
    prompt = 'Transcribe this spoken audio accurately. Include punctuation and paragraphs.',
  } = params

  const cleanBase64 = base64Audio.replace(/^data:[^;]+;base64,/, '')

  const audioPart = {
    inlineData: {
      mimeType,
      data: cleanBase64,
    },
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-transcribe',
    contents: {
      parts: [audioPart, { text: prompt }],
    },
  })

  return {
    text: response.text || '',
    model: 'gemini-3.5-transcribe',
  }
}

/**
 * Text-to-Speech with gemini-3.8-flash-lite-tts
 */
export async function generateSpeechTTS(params: {
  text: string
  voiceName?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr'
}) {
  const ai = getGeminiClient()
  const { text, voiceName = 'Kore' } = params

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash-lite-tts',
    contents: [
      {
        role: 'user',
        parts: [{ text }],
      },
    ],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  })

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || ''

  return {
    audioUrl: base64Audio ? `data:audio/wav;base64,${base64Audio}` : null,
    base64Data: base64Audio,
    mimeType: 'audio/wav',
    voiceName,
    model: 'gemini-3.8-flash-lite-tts',
  }
}
