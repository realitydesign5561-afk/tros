import Link from 'next/link'
import { ArrowUpRight, Globe2, Megaphone, UserPlus, Sparkles, HelpCircle, Users, BookOpen, BarChart3, Settings } from 'lucide-react'

export function DashboardHome() {
  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full">
      
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        
        {/* Top Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['Organization', 'Teams', 'Users', 'Subscription', 'Payment', 'Installed Apps', 'Variables', 'Scenario Properties'].map((item, i) => (
            <button key={item} className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${i === 0 ? 'bg-[#1a1c1a] text-white' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}>
              {item}
            </button>
          ))}
        </div>

        {/* Top Cards Row */}
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Card 1 - White */}
          <div className="rounded-[2rem] bg-white border border-border p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="size-4" />
                <span className="font-medium text-sm">Operations</span>
              </div>
              <button className="text-gray-400">⋮</button>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mt-8">
                <span className="text-6xl font-light tracking-tight">780</span>
                <span className="text-sm text-gray-400 font-medium">/ 1000</span>
              </div>
              <div className="flex gap-1 mt-6">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-8 w-6 rounded-full bg-[#1a1c1a]" />)}
                <div className="h-8 w-6 rounded-full border border-dashed border-gray-300" />
              </div>
            </div>
            {/* Float badge */}
            <div className="absolute top-24 right-10 flex items-center gap-1.5 rounded-full bg-secondary/30 px-3 py-1">
              <span className="text-sm font-semibold">82%</span>
              <div className="size-3 rounded-full border-2 border-[#1a1c1a]" />
            </div>
          </div>

          {/* Card 2 - Lime Green */}
          <div className="relative rounded-[2rem] bg-secondary p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="size-4" />
                <span className="font-medium text-sm">Data Transfer</span>
              </div>
              <button className="text-gray-600">⋮</button>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mt-8">
                <span className="text-6xl font-light tracking-tight">163</span>
                <span className="text-sm text-gray-500 font-medium">/ 512.0 MB</span>
              </div>
              <div className="flex gap-1 mt-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-6 rounded-full bg-[#1a1c1a]" />)}
                {[1, 2].map(i => <div key={i} className="h-8 w-6 rounded-full border border-dashed border-gray-400" />)}
              </div>
            </div>
            {/* Float badge */}
            <div className="absolute top-24 right-10 flex items-center gap-1.5 rounded-full bg-white/50 px-3 py-1">
              <span className="text-sm font-semibold">68%</span>
              <div className="size-3 rounded-full border-2 border-white" />
            </div>
          </div>

          {/* Card 3 - Dark Theme */}
          <div className="relative overflow-hidden rounded-[2rem] bg-[#1a1c1a] p-6 text-white shadow-xl flex flex-col justify-between min-h-[220px]">
            <div className="relative z-10">
              <h3 className="text-3xl font-light leading-[1.1] mb-2 tracking-tight">
                Take You <br/> Automation <br/> to the Next <br/> Level
              </h3>
            </div>
            <button className="relative z-10 mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-100">
              Upgrade <ArrowUpRight className="size-4" />
            </button>
            {/* Decorative background visual (simulate the robot image from the mockup) */}
            <div className="absolute -bottom-10 -right-10 size-48 rounded-full bg-gradient-to-br from-emerald-500/20 to-transparent blur-3xl" />
          </div>

        </div>

        {/* Statistics Chart Section */}
        <div className="rounded-[2.5rem] bg-white border border-border p-8 shadow-sm h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <h3 className="flex items-center gap-2 text-xl font-medium">
                <BarChart3 className="size-5" /> Statistics
              </h3>
              <div className="flex items-center gap-4 text-sm font-medium">
                <span className="flex items-center gap-2 text-black"><span className="size-2 rounded-full bg-black" /> Operations</span>
                <span className="flex items-center gap-2 text-gray-400"><span className="size-2 rounded-full bg-secondary" /> Data transfer</span>
              </div>
            </div>
            <select className="rounded-full border-none bg-gray-50 px-4 py-2 text-sm font-medium outline-none">
              <option>2025</option>
            </select>
          </div>
          
          {/* Mock Chart */}
          <div className="relative h-64 w-full flex items-end justify-between px-10">
            {/* Y axis */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-400 font-mono">
              {[1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1].map(n => <span key={n}>{n.toFixed(1)}</span>)}
            </div>
            {/* Bars */}
            {[
              { label: '27 Jun', h1: '90%', h2: '50%' },
              { label: '28 Jun', h1: '60%', h2: '30%' },
              { label: '29 Jun', h1: '70%', h2: '25%' },
              { label: '30 Jun', h1: '0%', h2: '0%', empty: true },
              { label: '1 Jul', h1: '95%', h2: '40%', active: true },
              { label: '2 Jul', h1: '0%', h2: '0%', empty: true },
              { label: '3 Jul', h1: '55%', h2: '45%' },
              { label: '4 Jul', h1: '50%', h2: '30%' },
            ].map((bar, i) => (
              <div key={i} className="relative flex flex-col items-center justify-end h-full w-8">
                {bar.empty ? (
                  <div className="h-full border-l-2 border-dashed border-gray-200" />
                ) : (
                  <div className="relative w-full rounded-full bg-black flex flex-col justify-end overflow-hidden shadow-lg" style={{ height: bar.h1 }}>
                    <div className="w-full rounded-full bg-secondary transition-all" style={{ height: bar.h2 }}>
                      <div className="mt-2 size-2 mx-auto rounded-full bg-black" />
                    </div>
                  </div>
                )}
                {bar.active && (
                  <span className="absolute -left-8 top-1/2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold">32%</span>
                )}
                <span className="absolute -bottom-8 whitespace-nowrap text-xs text-gray-400 font-medium">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar widgets */}
      <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
        <div className="flex gap-4">
          <div className="flex-1 rounded-[2rem] bg-[#f4f5f4] p-6 flex flex-col items-center justify-center gap-3 text-center transition hover:bg-white hover:shadow-sm">
            <div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Users className="size-5" />
            </div>
            <span className="font-medium">Community</span>
          </div>
          <div className="flex-1 rounded-[2rem] bg-[#f4f5f4] p-6 flex flex-col items-center justify-center gap-3 text-center transition hover:bg-white hover:shadow-sm">
            <div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <BookOpen className="size-5" />
            </div>
            <span className="font-medium">Academy</span>
          </div>
        </div>

        <div className="flex-1 rounded-[2rem] bg-[#f4f5f4] p-6 space-y-2">
          {[
            { title: 'Help Center', desc: 'Explore our detailed documentatio...', icon: HelpCircle },
            { title: 'Partner Directory', desc: 'Find the perfect partner to suppor...', icon: Users },
            { title: 'Blog', desc: 'Access popular guides & stories ab...', icon: Globe2 },
            { title: 'Use Cases', desc: 'Get inspired by all the ways you ca...', icon: BarChart3 }
          ].map((item, i) => (
            <div key={i} className="group flex items-start justify-between rounded-2xl p-4 transition hover:bg-white hover:shadow-sm cursor-pointer">
              <div className="space-y-3">
                <div className="size-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:bg-gray-50">
                  <item.icon className="size-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
              <ArrowUpRight className="size-4 text-gray-400 group-hover:text-black" />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
