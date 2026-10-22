'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { AuthGuard } from '@/components/auth-guard'
import {
  Briefcase,
  Building,
  CheckCircle2,
  DollarSign,
  Globe2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
  ExternalLink,
  Layers,
} from 'lucide-react'
import Link from 'next/link'

interface ClientRecord {
  id: string
  name: string
  company: string
  email: string
  phone?: string | null
  website?: string | null
  status: string
  services?: string | null
  budget?: number | null
  notes?: string | null
  createdAt: string
  projects?: any[]
}

const AVAILABLE_SERVICES = [
  'Website Design & Development',
  'Commercial Flyers & Graphics',
  'Faceless YouTube Automation',
  'Omnichannel Social Media OS',
  'Google Business Profile Setup',
  'Lead Generation & B2B Outreach',
]

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [budget, setBudget] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const toggleService = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    )
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          company: company || name,
          email,
          phone,
          website,
          budget: budget ? parseFloat(budget) : null,
          services: selectedServices,
          notes,
          status: 'ACTIVE',
        }),
      })

      if (res.ok) {
        setName('')
        setCompany('')
        setEmail('')
        setPhone('')
        setWebsite('')
        setBudget('')
        setSelectedServices([])
        setNotes('')
        setShowAddModal(false)
        await fetchClients()
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to remove this client workspace?')) return
    try {
      await fetch(`/api/clients?id=${id}`, { method: 'DELETE' })
      setClients((prev) => prev.filter((c) => c.id !== id))
      if (selectedClient?.id === id) setSelectedClient(null)
    } catch {
      // ignore
    }
  }

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AuthGuard>
      <DashboardShell>
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eaf79f] bg-[#eaf79f]/10 border border-[#eaf79f]/20 px-2.5 py-0.5 rounded-full">
                  Agency Operations
                </span>
                <span className="text-xs text-white/50">Client Workspace & Deliverables Management</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                <Briefcase className="size-8 text-[#eaf79f]" /> Client Workspaces
              </h1>
              <p className="mt-1 text-sm text-white/60 max-w-2xl">
                Maintain isolated workspaces for each client with their purchased services, brand guidelines, deliverables, websites, and creative assets.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#eaf79f] text-black px-4 py-2.5 text-xs sm:text-sm font-semibold hover:bg-white transition shadow-sm"
              >
                <Plus className="size-4" /> Add Client Workspace
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between gap-4 bg-[#141615] p-4 rounded-2xl border border-white/10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
              <input
                type="text"
                placeholder="Search clients by name, company, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 rounded-xl bg-[#0a0c0b] border border-white/10 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-white/40 outline-none focus:border-[#eaf79f]"
              />
            </div>
            <p className="text-xs text-white/40">{filteredClients.length} Workspaces</p>
          </div>

          {/* Clients Grid */}
          {loading ? (
            <div className="p-16 text-center text-white/40 text-sm">Loading workspaces...</div>
          ) : filteredClients.length === 0 ? (
            <div className="p-16 text-center rounded-3xl border border-dashed border-white/10 bg-[#121413] space-y-3">
              <Briefcase className="size-10 text-white/20 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Client Workspaces Configured</h3>
              <p className="text-xs text-white/50 max-w-md mx-auto">
                Create your first client workspace to coordinate website design, social media scheduling, and flyers under a dedicated brand profile.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#eaf79f] text-black px-4 py-2 text-xs font-semibold hover:bg-white transition"
              >
                <Plus className="size-4" /> Create Workspace
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => {
                let servicesList: string[] = []
                try {
                  if (client.services) servicesList = JSON.parse(client.services)
                } catch {}

                return (
                  <div
                    key={client.id}
                    className="p-6 rounded-3xl border border-white/10 bg-[#121413] hover:border-white/20 transition flex flex-col justify-between space-y-5"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            {client.status}
                          </span>
                          <h3 className="text-xl font-bold text-white mt-2 leading-tight">
                            {client.company}
                          </h3>
                          <p className="text-xs text-white/60 mt-0.5">Contact: {client.name}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          title="Delete client"
                          className="p-1.5 text-white/30 hover:text-red-400 rounded-lg transition"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="mt-4 space-y-1.5 text-xs text-white/60">
                        <div className="flex items-center gap-2">
                          <Mail className="size-3.5 text-white/40" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="size-3.5 text-white/40" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.website && (
                          <div className="flex items-center gap-2">
                            <Globe2 className="size-3.5 text-white/40" />
                            <a
                              href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary text-[#eaf79f] hover:underline truncate"
                            >
                              {client.website}
                            </a>
                          </div>
                        )}
                        {client.budget && (
                          <div className="flex items-center gap-2 text-white font-medium">
                            <DollarSign className="size-3.5 text-[#eaf79f]" />
                            <span>Budget / Retainer: ${client.budget.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {servicesList.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
                            Purchased Services:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {servicesList.map((srv) => (
                              <span
                                key={srv}
                                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/80"
                              >
                                {srv}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                      <Link
                        href={`/website-factory?client=${client.id}`}
                        className="text-[#eaf79f] hover:underline font-medium flex items-center gap-1"
                      >
                        Launch Website <ExternalLink className="size-3" />
                      </Link>
                      <Link
                        href={`/designer?client=${client.id}`}
                        className="text-white/60 hover:text-white font-medium"
                      >
                        Design Flyers →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Create Client Modal */}
          {showAddModal && (
            <div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowAddModal(false)}
            >
              <div
                className="w-full max-w-xl bg-[#141615] border border-white/20 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between pb-3 border-b border-white/10">
                  <div>
                    <h2 className="text-xl font-bold text-white">Create Client Workspace</h2>
                    <p className="text-xs text-white/60 mt-0.5">
                      Configure client details and services to isolate project assets.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1 rounded-lg text-white/60 hover:text-white"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateClient} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-white/50 mb-1">
                        Company Name *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Apex Realty Lagos"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full h-10 rounded-xl bg-[#0a0c0b] border border-white/10 px-3 text-xs sm:text-sm text-white outline-none focus:border-[#eaf79f]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-white/50 mb-1">
                        Contact Person *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Sarah Jenkins"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-10 rounded-xl bg-[#0a0c0b] border border-white/10 px-3 text-xs sm:text-sm text-white outline-none focus:border-[#eaf79f]"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-white/50 mb-1">
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="sarah@apexrealty.demo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-10 rounded-xl bg-[#0a0c0b] border border-white/10 px-3 text-xs sm:text-sm text-white outline-none focus:border-[#eaf79f]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-white/50 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+234 800 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-10 rounded-xl bg-[#0a0c0b] border border-white/10 px-3 text-xs sm:text-sm text-white outline-none focus:border-[#eaf79f]"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-white/50 mb-1">
                        Current Website
                      </label>
                      <input
                        type="text"
                        placeholder="https://apexrealty.ng"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full h-10 rounded-xl bg-[#0a0c0b] border border-white/10 px-3 text-xs sm:text-sm text-white outline-none focus:border-[#eaf79f]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-white/50 mb-1">
                        Budget / Retainer ($)
                      </label>
                      <input
                        type="number"
                        placeholder="2500"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full h-10 rounded-xl bg-[#0a0c0b] border border-white/10 px-3 text-xs sm:text-sm text-white outline-none focus:border-[#eaf79f]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-white/50 mb-2">
                      Purchased Services
                    </label>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {AVAILABLE_SERVICES.map((srv) => {
                        const selected = selectedServices.includes(srv)
                        return (
                          <button
                            key={srv}
                            type="button"
                            onClick={() => toggleService(srv)}
                            className={`p-2.5 rounded-xl border text-xs text-left transition flex items-center justify-between ${
                              selected
                                ? 'border-[#eaf79f] bg-[#eaf79f]/10 text-white font-medium'
                                : 'border-white/10 bg-[#0a0c0b] text-white/60 hover:text-white'
                            }`}
                          >
                            <span>{srv}</span>
                            {selected && <CheckCircle2 className="size-3.5 text-[#eaf79f]" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-white/50 mb-1">
                      Project Notes & Brand Directives
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Special client requirements, brand colors, delivery deadlines..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl bg-[#0a0c0b] border border-white/10 p-3 text-xs sm:text-sm text-white outline-none focus:border-[#eaf79f] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 rounded-xl bg-[#eaf79f] text-black font-bold text-sm hover:bg-white transition"
                  >
                    {submitting ? 'Creating Workspace...' : 'Save Client Workspace'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </DashboardShell>
    </AuthGuard>
  )
}
