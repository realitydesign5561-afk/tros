import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare, hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const runtimeUrl =
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

const isSecure = process.env.NODE_ENV === 'production' && runtimeUrl.startsWith('https://')

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'tros-development-secret-change-in-production',
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  cookies: {
    sessionToken: {
      name: `${isSecure ? '__Secure-' : ''}next-auth.session-token`,
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: isSecure },
    },
  },
  providers: [CredentialsProvider({
    name: 'Credentials',
    credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) return null

      const email = String(credentials.email).trim().toLowerCase()
      const password = String(credentials.password)
      const isDemoAdmin = email === 'admin@reality.com' && password === 'admin123'

      try {
        let user = await prisma.user.findUnique({ where: { email } })

        // Keep the documented demo access usable on fresh deployments and on
        // databases that were created before the seed script ran.
        if (isDemoAdmin) {
          const passwordHash = await hash(password, 12)
          user = user
            ? await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash, name: 'TROS Admin', role: 'ADMIN' },
              })
            : await prisma.user.create({
                data: { email, passwordHash, name: 'TROS Admin', role: 'ADMIN' },
              })
        }

        if (user && (await compare(password, user.passwordHash))) {
          return { id: user.id, email: user.email, name: user.name, role: user.role }
        }
      } catch (error) {
        console.error('[v0] Production auth database unavailable:', error)
      }

      // Vercel serverless deployments may not have a writable/persistent
      // SQLite filesystem. Keep the documented demo account usable while the
      // database is being configured, without accepting arbitrary credentials.
      if (isDemoAdmin) {
        return {
          id: 'tros-demo-admin',
          email: 'admin@reality.com',
          name: 'TROS Admin',
          role: 'ADMIN',
        }
      }

      return null
    },
  })],
  callbacks: {
    async jwt({ token, user }) { if (user) { token.sub = user.id; token.role = (user as { role?: string }).role }; return token },
    async session({ session, token }) { if (session.user) { session.user.id = token.sub as string; session.user.role = token.role as string }; return session },
  },
}
