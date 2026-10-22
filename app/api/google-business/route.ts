import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const profiles = await prisma.googleBusinessProfile.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ profiles })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch profiles' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { businessName, address, phone, website, category } = body

    if (!businessName?.trim()) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }

    const profile = await prisma.googleBusinessProfile.create({
      data: {
        ownerId: session.user.id,
        businessName: businessName.trim(),
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        category: category?.trim() || 'Digital Agency',
        status: 'UNVERIFIED',
        verified: false,
        reviewsCount: 0,
        rating: 0.0,
      },
    })

    return NextResponse.json({ profile }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create profile' }, { status: 500 })
  }
}
