import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN' || !session.user.id) throw new Error('ADMIN_REQUIRED')
  return session.user
}
