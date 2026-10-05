import Link from 'next/link'
import { ArrowUpRight, Globe2, LayoutTemplate, Users, Sparkles, MessageSquare, MonitorPlay } from 'lucide-react'

export function DashboardHome() {
  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-8rem)]">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Welcome Section */}
        <div className="rounded-[2.5rem] bg-white border border-gray-100 p-10 lg:p-12 shadow-sm flex flex-col justify-center min-h-[250px] relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-[#1B1E1C] mb-4">
              Welcome back to <span className="font-medium">TROS OS.</span>
            </h1>
            <p className="text-gray-500 text-lg">
              Everything you need to build, design, and grow your community in one unified workspace. What would you like to create today?
            </p>
          </div>
          {/* Decorative element */}
          <div className="absolute -right-20 -top-20 size-96 rounded-full bg-gradient-to-br from-[#EAF79F]/40 to-transparent blur-3xl pointer-events-none" />
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3 flex-1">
          
          {/* Website Factory */}
          <Link href="/website-factory" className="group relative overflow-hidden rounded-[2.5rem] bg-[#1a1c1a] p-8 text-white shadow-lg flex flex-col justify-between transition-transform hover:-translate-y-1">
            <div className="relative z-10">
              <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <MonitorPlay className="size-6 text-white" />
              </div>
              <h3 className="text-3xl font-light leading-tight mb-2 tracking-tight">
                Website <br/><span className="font-medium">Factory</span>
              </h3>
              <p className="text-gray-400 text-sm mt-4">Prompt-based website and app builder. Generate entire platforms instantly.</p>
            </div>
            <div className="relative z-10 mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#EAF79F] px-4 py-3 text-sm font-semibold text-black transition group-hover:bg-[#d8e88e]">
              Launch Factory <ArrowUpRight className="size-4" />
            </div>
          </Link>

          {/* AI Designer */}
          <Link href="/designer" className="group relative overflow-hidden rounded-[2.5rem] bg-[#F4F5F4] p-8 text-[#1B1E1C] border border-gray-100 shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1">
            <div className="relative z-10">
              <div className="size-12 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-6">
                <LayoutTemplate className="size-6 text-[#1B1E1C]" />
              </div>
              <h3 className="text-3xl font-light leading-tight mb-2 tracking-tight">
                AI <br/><span className="font-medium">Designer</span>
              </h3>
              <p className="text-gray-500 text-sm mt-4">Upload mockups or prompt the AI to generate and redesign user interfaces.</p>
            </div>
            <div className="relative z-10 mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-3 text-sm font-semibold text-black transition group-hover:bg-gray-50 shadow-sm">
              Open Designer <ArrowUpRight className="size-4" />
            </div>
          </Link>

          {/* Social OS */}
          <Link href="/social" className="group relative overflow-hidden rounded-[2.5rem] bg-[#EAF79F] p-8 text-[#1B1E1C] shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1">
            <div className="relative z-10">
              <div className="size-12 bg-white/50 rounded-2xl flex items-center justify-center mb-6">
                <Users className="size-6 text-[#1B1E1C]" />
              </div>
              <h3 className="text-3xl font-light leading-tight mb-2 tracking-tight">
                Social <br/><span className="font-medium">OS</span>
              </h3>
              <p className="text-gray-700 text-sm mt-4">Prompt the AI to create content, generate images, and build your community.</p>
            </div>
            <div className="relative z-10 mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#1a1c1a] px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-black shadow-lg">
              Manage Community <ArrowUpRight className="size-4" />
            </div>
          </Link>

        </div>
      </div>

    </div>
  )
}
