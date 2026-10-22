'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { AuthGuard } from '@/components/auth-guard'
import { builtInAgents, AgentDefinition } from '@/lib/agent/agents'
import {
  Bot,
  CheckCircle2,
  Cpu,
  Layers,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

export default function AgentsPage() {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState<string>('ALL')
  const [selectedAgent, setSelectedAgent] = useState<AgentDefinition | null>(null)

  const departments = ['ALL', 'Executive', 'Engineering', 'Creative', 'Video & YouTube', 'Growth & Social', 'Sales & CRM', 'Security & Operations']

  const filteredAgents = builtInAgents.filter((agent) => {
    const matchSearch =
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.role.toLowerCase().includes(search.toLowerCase()) ||
      agent.description.toLowerCase().includes(search.toLowerCase())
    const matchDept = selectedDept === 'ALL' || agent.department === selectedDept
    return matchSearch && matchDept
  })

  return (
    <AuthGuard>
      <DashboardShell>
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eaf79f] bg-[#eaf79f]/10 border border-[#eaf79f]/20 px-2.5 py-0.5 rounded-full">
                  Autonomous Workforce
                </span>
                <span className="text-xs text-white/50">20 Specialized Digital Operators</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                <Bot className="size-8 text-[#eaf79f]" /> AI Workforce Directory
              </h1>
              <p className="mt-1 text-sm text-white/60 max-w-2xl">
                Every agent possesses an explicit operational role, assigned tools, restricted permissions, and concrete output contracts to prevent runaway loops and token waste.
              </p>
            </div>

            <Link
              href="/command-center"
              className="inline-flex items-center gap-2 rounded-xl bg-[#eaf79f] text-black px-4 py-2.5 text-xs sm:text-sm font-semibold hover:bg-white transition shrink-0"
            >
              <Terminal className="size-4" /> Delegate via Command Center
            </Link>
          </div>

          {/* Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#141615] p-4 rounded-2xl border border-white/10">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
              <input
                type="text"
                placeholder="Search agent by name or capability..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 rounded-xl bg-[#0a0c0b] border border-white/10 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-white/40 outline-none focus:border-[#eaf79f]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedDept === dept
                      ? 'bg-[#eaf79f] text-black'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Agent Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className="p-5 rounded-2xl border border-white/10 bg-[#121413] hover:border-[#eaf79f]/50 hover:bg-white/[0.03] transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/5 px-2 py-0.5 rounded-md">
                      {agent.department}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white group-hover:text-[#eaf79f] transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-xs font-medium text-white/60 mt-0.5">{agent.role}</p>

                  <p className="text-xs text-white/50 mt-3 line-clamp-3 leading-relaxed">
                    {agent.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Wrench className="size-3 text-[#eaf79f]" /> {agent.tools.length} Tools
                  </span>
                  <span className="text-primary hover:underline text-[11px] font-semibold text-[#eaf79f]">
                    Inspect Spec →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Agent Details Modal */}
          {selectedAgent && (
            <div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedAgent(null)}
            >
              <div
                className="w-full max-w-2xl bg-[#141615] border border-white/20 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between pb-4 border-b border-white/10">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#eaf79f] bg-[#eaf79f]/10 border border-[#eaf79f]/20 px-2.5 py-0.5 rounded-full">
                      {selectedAgent.department} Agent
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-2">{selectedAgent.name}</h2>
                    <p className="text-sm text-white/60">{selectedAgent.role}</p>
                  </div>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-1.5">
                    Primary Operational Directive
                  </h4>
                  <p className="text-sm text-white/80 leading-relaxed bg-[#0a0c0b] p-4 rounded-xl border border-white/5">
                    {selectedAgent.description}
                  </p>
                </div>

                {/* Tools Authorized */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">
                    Authorized Tools ({selectedAgent.tools.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.tools.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-white flex items-center gap-1.5"
                      >
                        <Wrench className="size-3 text-[#eaf79f]" /> {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Permissions & Security Gates */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">
                    Least-Privilege Role Boundaries
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.permissions.map((p) => (
                      <span
                        key={p}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center gap-1.5"
                      >
                        <ShieldCheck className="size-3" /> {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Output Contract */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-1.5">
                    Standard Output Contract
                  </h4>
                  <p className="text-xs font-mono text-white/80 bg-[#0a0c0b] p-3 rounded-xl border border-white/5">
                    {selectedAgent.outputContract}
                  </p>
                </div>

                {/* System Prompt Directives */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-1.5">
                    System Prompt Guidance
                  </h4>
                  <p className="text-xs italic text-white/60 bg-[#0a0c0b] p-3 rounded-xl border border-white/5">
                    "{selectedAgent.systemPrompt}"
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/command-center?agent=${selectedAgent.key}`}
                    className="w-full h-11 rounded-xl bg-[#eaf79f] text-black font-bold text-sm hover:bg-white transition flex items-center justify-center gap-2"
                  >
                    <Terminal className="size-4" /> Assign Work in Command Center
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </DashboardShell>
    </AuthGuard>
  )
}
