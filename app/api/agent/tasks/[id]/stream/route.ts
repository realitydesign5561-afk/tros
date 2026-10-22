import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const task = await prisma.agentTask.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true },
  })
  if (!task) return new Response('Task not found', { status: 404 })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false
      const close = () => {
        if (!closed) {
          closed = true
          try {
            controller.close()
          } catch {}
        }
      }
      request.signal.addEventListener('abort', close)

      try {
        let sentCount = 0
        for (let attempt = 0; attempt < 60 && !closed; attempt += 1) {
          const events = await prisma.agentTaskEvent.findMany({
            where: { taskId: task.id },
            orderBy: { createdAt: 'asc' },
            skip: sentCount,
            take: 50,
          })

          for (const event of events) {
            sentCount += 1
            controller.enqueue(encoder.encode(`event: message\ndata: ${JSON.stringify(event)}\n\n`))
          }

          const current = await prisma.agentTask.findUnique({
            where: { id: task.id },
            select: { status: true, progress: true, currentStep: true, error: true },
          })
          controller.enqueue(encoder.encode(`event: status\ndata: ${JSON.stringify(current)}\n\n`))

          if (current && ['COMPLETED', 'FAILED', 'CANCELLED'].includes(current.status)) {
            break
          }
          await new Promise((resolve) => setTimeout(resolve, 1_500))
        }
      } finally {
        request.signal.removeEventListener('abort', close)
        close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
