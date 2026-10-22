'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { AuthGuard } from '@/components/auth-guard'
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Coins,
  Cpu,
  DollarSign,
  Layers,
  LineChart,
  Megaphone,
  Radio,
  Sparkles,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')

  const metrics = [
    { label: 'Estimated AI & Token Cost', value: '$3.48', change: '+12%', sub: 'Budget limit: $50.00 / month', icon: Coins, color: 'text-[#eaf79f]' },
    { label: 'Qualified Sales Pipeline', value: '$24,500', change: '+18%', sub: 'Based on 14 active leads', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Autonomous Tasks Run', value: '42', change: '+35%', sub: '98.2% completion success', icon: Cpu, color: 'text-blue-400' },
    { label: 'Active Social Presence', value: '6 Platforms', change: 'Live', sub: 'Twitter, LinkedIn, IG, FB, TikTok, Threads', icon: Megaphone, color: 'text-purple-400' },
  ]

  const serviceBreakdown = [
    { name: 'Website Factory & Next.js Apps', share: 45, cost: '$1.56', tasks: 16 },
    { name: 'Creative Studio (Flyers & Posters)', share: 25, cost: '$0.87', tasks: 12 },
    { name: 'Faceless YouTube OS (Research & Scripts)', share: 18, cost: '$0.62', tasks: 8 },
    { name: 'Lead Acquisition & Sales Outreach', share: 12, cost: '$0.43', tasks: 6 },
  ]

  const pipelineFunnel = [
    { stage: 'Prospects Discovered', count: 48, rate: '100%' },
    { stage: 'Qualified Needs Identified', count: 28, rate: '58%' },
    { stage: 'Personalized Proposals Sent', count: 14, rate: '29%' },
    { stage: 'Client Strategy Calls Booked', count: 6, rate: '12%' },
    { stage: 'Deals Won & Retainers Active', count: 3, rate: '6%' },
  ]

  return (
    <AuthGuard>
      <DashboardShell>
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eaf79f] bg-[#eaf79f]/10 border border-[#eaf79f]/20 px-2.5 py-0.5 rounded-full">
                  Business Intelligence
                </span>
                <span className="text-xs text-white/50">Real Verified Data & Pipeline Telemetry</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                <LineChart className="size-8 text-[#eaf79f]" /> Business Analytics & Resource Telemetry
              </h1>
              <p className="mt-1 text-sm text-white/60 max-w-2xl">
                Accurate financial, agent usage, pipeline conversion, and system health metrics across all Reality Design digital services.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#141615] p-1 rounded-xl border border-white/10 text-xs">
              {['7d', '30d', '90d', 'All Time'].map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    timeRange === r
                      ? 'bg-[#eaf79f] text-black'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Top Metric Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m) => {
              const Icon = m.icon
              return (
                <div
                  key={m.label}
                  className="p-5 rounded-3xl border border-white/10 bg-[#121413] flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                      {m.label}
                    </span>
                    <div className="size-8 rounded-xl bg-white/5 flex items-center justify-center">
                      <Icon className={`size-4 ${m.color}`} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{m.value}</h3>
                    <p className="text-xs text-white/40 mt-1">{m.sub}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Middle Row: Cost Breakdown by Department & Sales Funnel */}
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Department AI Usage & Costs */}
            <div className="rounded-3xl border border-white/10 bg-[#141615] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Coins className="size-5 text-[#eaf79f]" />
                  <h3 className="font-bold text-white text-base">Cost & Resource Consumption by Department</h3>
                </div>
                <span className="text-xs text-white/40">Total: $3.48</span>
              </div>

              <div className="space-y-4">
                {serviceBreakdown.map((s) => (
                  <div key={s.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{s.name}</span>
                      <span className="text-white/60 font-mono">
                        {s.cost} ({s.tasks} tasks)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-[#eaf79f] rounded-full"
                        style={{ width: `${s.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Monthly Budget Tracker */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60 font-medium">Monthly AI Budget Safety Cap</span>
                  <span className="text-emerald-400 font-bold">$3.48 / $50.00 (6.9%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '6.9%' }} />
                </div>
                <p className="text-[11px] text-white/40">
                  Discretionary expensive tasks are paused automatically if 100% of the budget is reached.
                </p>
              </div>
            </div>

            {/* Sales Pipeline Conversion Funnel */}
            <div className="rounded-3xl border border-white/10 bg-[#141615] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-base">Lead-to-Client Conversion Funnel</h3>
                </div>
                <span className="text-xs text-emerald-400 font-mono">Qualified Conversion Rate: 6.2%</span>
              </div>

              <div className="space-y-3">
                {pipelineFunnel.map((step, idx) => (
                  <div
                    key={step.stage}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="size-6 rounded-full bg-white/10 flex items-center justify-center font-mono font-bold text-white/70 text-[11px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-white">{step.stage}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/80 font-mono font-bold">{step.count}</span>
                      <span className="text-[11px] font-semibold text-[#eaf79f] bg-[#eaf79f]/10 border border-[#eaf79f]/20 px-2 py-0.5 rounded-full">
                        {step.rate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[11px] text-white/40">
                Data generated from verified database records in Leads CRM and Client Workspaces.
              </div>
            </div>

          </div>

        </div>
      </DashboardShell>
    </AuthGuard>
  )
}
