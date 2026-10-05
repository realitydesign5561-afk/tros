'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Bot, Loader2, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl: '/',
    })
    if (!result || result.error || !result.ok) {
      setError(result?.error || 'Invalid credentials')
      setLoading(false)
      return
    }
    router.replace('/')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-[#A9B3A7] text-[#1B1E1C] flex items-center justify-center p-4 md:p-8">
      <div className="flex w-full max-w-[1200px] h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] rounded-[2.5rem] bg-white shadow-2xl overflow-hidden">
        
        {/* Left Side: Dark Hero Panel */}
        <section className="relative hidden w-1/2 overflow-hidden bg-[#1B1E1C] text-white lg:flex lg:flex-col justify-between p-12">
          <div className="absolute -right-24 top-16 size-96 rounded-full border-[42px] border-[#383B39]" />
          
          <div className="relative flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#EAF79F] text-[#1B1E1C]">
              <Sparkles className="size-6" />
            </div>
            <span className="font-semibold text-xl tracking-tight">TROS / 01</span>
          </div>
          
          <div className="relative max-w-xl pb-20">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">Reality operations system</p>
            <h1 className="mt-6 text-6xl font-light leading-[1.05] tracking-tight">
              Build the <br/><span className="font-medium">reality you <br/>want to run.</span>
            </h1>
            <p className="mt-8 max-w-sm text-sm leading-6 text-white/65 font-medium">
              One unified command center to manage your websites, automated social media, lead generation, and course creation.
            </p>
          </div>
        </section>

        {/* Right Side: Login Form */}
        <section className="flex flex-1 items-center justify-center px-6 py-10 bg-[#F4F5F4]">
          <div className="w-full max-w-md">
            
            <div className="mb-10 lg:hidden flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#1B1E1C] text-[#EAF79F]">
                <Sparkles className="size-5" />
              </div>
              <span className="font-semibold text-xl tracking-tight">TROS</span>
            </div>
            
            <div className="mb-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">Private workspace</p>
              <h2 className="mt-3 text-4xl font-light tracking-tight">Welcome <span className="font-medium">back</span></h2>
              <p className="mt-3 text-sm font-medium text-gray-500">Sign in to your operations center.</p>
            </div>
            
            <form onSubmit={submit} className="space-y-5 rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
              <label className="block space-y-2 text-sm">
                <span className="font-semibold">Email</span>
                <input 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  type="email" 
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-[#F4F5F4] px-4 text-sm font-medium outline-none transition focus:border-black focus:ring-1 focus:ring-black" 
                />
              </label>
              <label className="block space-y-2 text-sm">
                <span className="font-semibold">Password</span>
                <input 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  type="password" 
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-[#F4F5F4] px-4 text-sm font-medium outline-none transition focus:border-black focus:ring-1 focus:ring-black" 
                />
              </label>
              
              {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
              
              <button 
                disabled={loading} 
                className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#1B1E1C] text-sm font-bold text-white transition hover:bg-black disabled:opacity-60"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                Enter workspace <ArrowUpRight className="size-4" />
              </button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 font-medium">
                  Don't have an account?{' '}
                  <a href="/auth/signup" className="text-[#1B1E1C] font-semibold hover:underline">
                    Sign up
                  </a>
                </p>
              </div>
            </form>
            
          </div>
        </section>
        
      </div>
    </main>
  )
}
