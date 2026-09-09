import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const input = await request.json() as { id?: string }
  if (!input.id) return NextResponse.json({ error: 'Alert id is required' }, { status: 400 })
  const alert = await prisma.workflowAlert.findFirst({ where: { id: input.id, workflow: { ownerId: userId } } })
  if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
  return NextResponse.json(await prisma.workflowAlert.update({ where: { id: alert.id }, data: { acknowledged: true } }))
}
