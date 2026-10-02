import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })
  const file = await prisma.websiteFile.findFirst({ where: { buildId: params.id, path: 'preview.html', build: { ownerId: session.user.id } } })
  if (!file || !file.verified) return new Response('Preview is not verified yet.', { status: 404 })
  return new Response(file.content, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': "sandbox allow-forms allow-scripts; default-src 'self' data: https:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:;", 'X-Content-Type-Options': 'nosniff' } })
}
