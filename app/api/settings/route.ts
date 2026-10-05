import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { provider, value } = body

    if (!provider || !value) {
      return NextResponse.json({ error: 'Missing provider or key' }, { status: 400 })
    }

    // In a real application, you would encrypt and store the API key in the database here.
    // For this demonstration, we acknowledge the receipt and return success.
    console.log(`Received API key for ${provider}`)

    return NextResponse.json({ success: true, message: `Connected to ${provider}` })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
