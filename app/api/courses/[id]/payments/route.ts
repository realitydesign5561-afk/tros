import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { provider, amount, currency = 'usd' } = await request.json()
  if (!['stripe', 'paystack', 'flutterwave'].includes(provider) || !Number.isInteger(amount) || amount <= 0) return NextResponse.json({ error: 'Valid provider and positive amount are required' }, { status: 400 })
  const course = await prisma.course.findFirst({ where: { id: params.id, owner: { email: session.user.email } } })
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  if (provider !== 'stripe') return NextResponse.json({ error: `${provider} is not configured`, configured: false, requiredEnv: provider === 'paystack' ? 'PAYSTACK_SECRET_KEY' : 'FLUTTERWAVE_SECRET_KEY' }, { status: 503 })
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const checkout = await stripe.checkout.sessions.create({ mode: 'payment', line_items: [{ price_data: { currency, product_data: { name: course.title }, unit_amount: amount }, quantity: 1 }], success_url: `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/courses/${course.id}?paid=1`, cancel_url: `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/courses/${course.id}`, metadata: { courseId: course.id, ownerEmail: session.user.email } })
  const link = await prisma.paymentLink.create({ data: { courseId: course.id, provider, currency, amount, status: 'OPEN', url: checkout.url, externalId: checkout.id } })
  return NextResponse.json(link)
}
