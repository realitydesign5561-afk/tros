import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const clients = await prisma.client.findMany({
      where: { ownerId: session.user.id },
      include: { projects: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ clients })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, company, email, phone, website, services, budget, notes, status } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
    }

    const client = await prisma.client.create({
      data: {
        ownerId: session.user.id,
        name: name.trim(),
        company: company?.trim() || name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        services: services ? JSON.stringify(services) : null,
        budget: budget ? Number(budget) : null,
        notes: notes?.trim() || null,
        status: status || 'ACTIVE',
      },
    })

    return NextResponse.json({ client }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create client' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Client ID required' }, { status: 400 })

    await prisma.client.deleteMany({
      where: { id, ownerId: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete client' }, { status: 500 })
  }
}
