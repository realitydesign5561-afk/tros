'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function Guard({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()
  useEffect(() => { if (status === 'unauthenticated') router.replace('/login') }, [status, router])
  if (status === 'loading') return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading TROS...</div>
  return <>{children}</>
}

export function AuthGuard({ children }: { children: React.ReactNode }) { return <SessionProvider><Guard>{children}</Guard></SessionProvider> }
