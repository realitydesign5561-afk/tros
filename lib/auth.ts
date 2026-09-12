import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare, hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const isSecure = process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL?.startsWith('https://')

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
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
      let user = await prisma.user.findUnique({ where: { email } })

      // Keep the documented demo access usable on fresh deployments and on
      // databases that were created before the seed script ran.
      if (email === 'admin@reality.com' && password === 'admin123') {
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

      if (!user || !(await compare(password, user.passwordHash))) return null
      return { id: user.id, email: user.email, name: user.name, role: user.role }
    },
  })],
  callbacks: {
    async jwt({ token, user }) { if (user) { token.sub = user.id; token.role = (user as { role?: string }).role }; return token },
    async session({ session, token }) { if (session.user) { session.user.id = token.sub as string; session.user.role = token.role as string }; return session },
  },
}
