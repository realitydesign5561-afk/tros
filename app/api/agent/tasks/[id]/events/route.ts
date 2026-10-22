import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const task = await prisma.agentTask.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 })

  const events = await prisma.agentTaskEvent.findMany({
    where: { taskId: task.id },
    orderBy: { createdAt: 'asc' },
    take: 100,
  })

  return NextResponse.json({ task, events })
}
