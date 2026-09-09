import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
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
      const user = await prisma.user.findUnique({ where: { email: credentials.email.toLowerCase() } })
      if (!user || !(await compare(credentials.password, user.passwordHash))) return null
      return { id: user.id, email: user.email, name: user.name, role: user.role }
    },
  })],
  callbacks: {
    async jwt({ token, user }) { if (user) { token.sub = user.id; token.role = (user as { role?: string }).role }; return token },
    async session({ session, token }) { if (session.user) { session.user.id = token.sub as string; session.user.role = token.role as string }; return session },
  },
}
