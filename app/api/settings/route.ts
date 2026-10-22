import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptSession } from '@/lib/crypto'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const keys = await prisma.apiKey.findMany({
      select: { provider: true, label: true, createdAt: true, updatedAt: true }
    })

    const connectedMap: Record<string, boolean> = {}

    // Check database keys
    for (const k of keys) {
      connectedMap[k.provider] = true
    }

    // Check server env keys
    if (process.env.OPENAI_API_KEY) connectedMap['OpenAI'] = true
    if (process.env.GEMINI_API_KEY) connectedMap['Gemini'] = true
    if (process.env.ELEVENLABS_API_KEY) connectedMap['ElevenLabs'] = true
    if (process.env.REPLICATE_API_TOKEN) connectedMap['Replicate'] = true
    if (process.env.RESEND_API_KEY) connectedMap['Resend'] = true
    if (process.env.STRIPE_SECRET_KEY) connectedMap['Stripe'] = true

    return NextResponse.json({
      connected: Object.keys(connectedMap).filter(k => connectedMap[k]),
      providers: keys.map(k => ({ provider: k.provider, label: k.label }))
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { provider, value, label } = body

    if (!provider || !value) {
      return NextResponse.json({ error: 'Missing provider or key' }, { status: 400 })
    }

    // Encrypt key with AES-256
    const encrypted = encryptSession(value.trim())

    const existing = await prisma.apiKey.findFirst({
      where: { provider }
    })

    if (existing) {
      await prisma.apiKey.update({
        where: { id: existing.id },
        data: {
          value: encrypted,
          label: label || provider,
        }
      })
    } else {
      await prisma.apiKey.create({
        data: {
          provider,
          label: label || provider,
          value: encrypted,
        }
      })
    }

    return NextResponse.json({ success: true, message: `Connected to ${provider}` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const provider = searchParams.get('provider')
    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
    }

    await prisma.apiKey.deleteMany({
      where: { provider }
    })

    return NextResponse.json({ success: true, message: `Disconnected ${provider}` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete' }, { status: 500 })
  }
}
