'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { AuthGuard } from '@/components/auth-guard'
import {
  AlertCircle,
  Building,
  CheckCircle2,
  ExternalLink,
  Globe,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
  Store,
  X,
  Zap,
} from 'lucide-react'

interface BusinessProfile {
  id: string
  businessName: string
  address?: string | null
  phone?: string | null
  website?: string | null
  category?: string | null
  status: string
  verified: boolean
  reviewsCount: number
  rating: number
  createdAt: string
}

export default function GoogleBusinessPage() {
  const [profiles, setProfiles] = useState<BusinessProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [category, setCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // AI Update Generation state
  const [generatingUpdate, setGeneratingUpdate] = useState(false)
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null)
  const [activeProfile, setActiveProfile] = useState<BusinessProfile | null>(null)

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await fetch('/api/google-business')
      if (res.ok) {
        const data = await res.json()
        setProfiles(data.profiles || [])
        if (data.profiles?.[0]) setActiveProfile(data.profiles[0])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessName.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/google-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, address, phone, website, category }),
      })

      if (res.ok) {
        setBusinessName('')
        setAddress('')
        setPhone('')
        setWebsite('')
        setCategory('')
        setShowAddModal(false)
        await fetchProfiles()
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  const handleGenerateLocalUpdate = async () => {
    if (!activeProfile) return
    setGeneratingUpdate(true)
    try {
      const prompt = `Write an engaging weekly Google Business Profile update for "${activeProfile.businessName}" located in ${activeProfile.address || 'the local metropolitan area'}. Category: ${activeProfile.category || 'Digital Agency'}. Use authentic local search terms, clear call to action, and business contact info.`
      const res = await fetch('/api/gemini/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode: 'maps' }),
      })
      const data = await res.json()
      if (data.text) {
        setGeneratedDraft(data.text)
        setGeneratingUpdate(false)
        return
      }
    } catch {
      // fallback
    }
    setGeneratedDraft(
      `📢 Special Update from ${activeProfile.businessName}!\n\nWe are excited to announce updated business hours and expanded digital services for all our local clients. Whether you need a high-converting website redesign, customized digital branding, or localized SEO strategies, our team is ready to serve you.\n\n📍 Visit us at ${activeProfile.address || 'our office'} or get in touch at ${activeProfile.website || 'our official website'}.\n\n#LocalBusiness #${activeProfile.category?.replace(/\s+/g, '') || 'DigitalServices'} #CustomerFirst`
    )
    setGeneratingUpdate(false)
  }

  return (
    <AuthGuard>
      <DashboardShell>
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eaf79f] bg-[#eaf79f]/10 border border-[#eaf79f]/20 px-2.5 py-0.5 rounded-full">
                  Local SEO & Presence
                </span>
                <span className="text-xs text-white/50">Google Business Profile Specialist Agent</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                <Store className="size-8 text-[#eaf79f]" /> Google Business Manager
              </h1>
              <p className="mt-1 text-sm text-white/60 max-w-2xl">
                Manage local listings, generate weekly Google business updates, optimize local map-pack search rankings, and handle review responses with verified integrity.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#eaf79f] text-black px-4 py-2.5 text-xs sm:text-sm font-semibold hover:bg-white transition shadow-sm"
            >
              <Plus className="size-4" /> Add Business Profile
            </button>
          </div>

          {/* Verification Notice */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
            <ShieldAlert className="size-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-white">Honest Verification Guarantee:</strong>
              <p className="text-white/70">
                Official Google Business verification (via postal postcard, phone, or live video) requires manual action by the business owner. TROS provides audit tools, content generation, and review assistants, but will never fabricate false verification states or fake customer reviews.
              </p>
            </div>
          </div>

          {/* Profiles Grid & Action Hub */}
          <div className="grid lg:grid-cols-[1fr_420px] gap-8">
            
            {/* Left: Profiles List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-base">Managed Locations & Profiles</h3>
                <span className="text-xs text-white/40">{profiles.length} Profiles</span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-white/40 text-sm">Loading profiles...</div>
              ) : profiles.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 bg-[#121413] space-y-3">
                  <Store className="size-10 text-white/20 mx-auto" />
                  <h4 className="font-bold text-white">No Profiles Registered</h4>
                  <p className="text-xs text-white/50 max-w-sm mx-auto">
                    Add your agency or a client's business to start preparing weekly Google search updates and local SEO audits.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#eaf79f] text-black px-4 py-2 text-xs font-semibold hover:bg-white transition"
                  >
                    <Plus className="size-4" /> Add Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {profiles.map((p) => {
                    const isSelected = activeProfile?.id === p.id
                    return (
                      <div
                        key={p.id}
                        onClick={() => setActiveProfile(p)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#eaf79f] bg-white/[0.06]'
                            : 'border-white/10 bg-[#121413] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  p.verified
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}
                              >
                                {p.verified ? 'VERIFIED' : 'PENDING VERIFICATION'}
                              </span>
                              <span className="text-xs text-white/40">{p.category}</span>
                            </div>
                            <h4 className="font-bold text-base text-white mt-1.5">{p.businessName}</h4>
                            <p className="text-xs text-white/50 flex items-center gap-1.5 mt-1">
                              <MapPin className="size-3 text-white/40" /> {p.address || 'Address pending'}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                              <Star className="size-3.5 fill-amber-400" />
                              <span>{p.rating.toFixed(1)}</span>
                            </div>
                            <span className="text-[11px] text-white/40">
                              {p.reviewsCount} reviews
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right: AI Local Content & Review Assistant */}
            <div className="rounded-3xl border border-white/10 bg-[#121413] p-6 space-y-6">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Sparkles className="size-4 text-[#eaf79f]" /> AI Local Update Generator
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  Draft high-engagement Google Business updates optimized for local search keywords.
                </p>
              </div>

              {activeProfile ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                    <p className="font-semibold text-white">Target Profile: {activeProfile.businessName}</p>
                    <p className="text-white/50">Category: {activeProfile.category || 'General'}</p>
                  </div>

                  <button
                    onClick={handleGenerateLocalUpdate}
                    disabled={generatingUpdate}
                    className="w-full h-10 rounded-xl bg-[#eaf79f] text-black font-semibold text-xs hover:bg-white transition flex items-center justify-center gap-2"
                  >
                    <Zap className="size-3.5" />
                    {generatingUpdate ? 'Generating Local Copy...' : 'Draft Weekly Google Update'}
                  </button>

                  {generatedDraft && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase text-white/40">
                        Generated Post Copy:
                      </label>
                      <textarea
                        rows={7}
                        value={generatedDraft}
                        onChange={(e) => setGeneratedDraft(e.target.value)}
                        className="w-full rounded-xl bg-[#0a0c0b] border border-white/10 p-3 text-xs text-white/90 leading-relaxed outline-none focus:border-[#eaf79f]"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(generatedDraft)
                          alert('Copied update to clipboard for Google Business posting!')
                        }}
                        className="w-full h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
                      >
                        Copy Post Content
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-white/40">
                  Select a business location on the left to generate updates.
                </div>
              )}
            </div>

          </div>

          {/* Modal */}
          {showAddModal && (
            <div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowAddModal(false)}
            >
              <div
                className="w-full max-w-lg bg-[#141615] border border-white/20 rounded-3xl p-6 sm:p-8 space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between pb-3 border-b border-white/10">
                  <h3 className="font-bold text-lg text-white">Register Google Business Profile</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-white/60 hover:text-white">
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateProfile} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-white/50 mb-1">
                      Business Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Reality Design Lagos"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#0a0c0b] border border-white/10 px-3 text-xs sm:text-sm text-white outline-none focus:border-[#eaf79f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-white/50 mb-1">
                      Primary Business Category
                    </label>
                    <input
                      type="text"
                      placeholder="Website Designer, Marketing Agency, Real Estate Consultant"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#0a0c0b] border border-white/10 px-3 text-xs sm:text-sm text-white outline-none focus:border-[#eaf79f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-white/50 mb-1">
                      Physical Address / Service Area
                    </label>
                    <input
                      type="text"
                      placeholder="12 Admiralty Way, Lekki Phase 1, Lagos"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#0a0c0b] border border-white/10 px-3 text-xs sm:text-sm text-white outline-none focus:border-[#eaf79f]"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-white/50 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="+234 800 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-10 rounded-xl bg-[#0a0c0b] border border-white/10 px-3 text-xs sm:text-sm text-white outline-none focus:border-[#eaf79f]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-white/50 mb-1">
                        Website
                      </label>
                      <input
                        type="text"
                        placeholder="https://tros-opal.vercel.app"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full h-10 rounded-xl bg-[#0a0c0b] border border-white/10 px-3 text-xs sm:text-sm text-white outline-none focus:border-[#eaf79f]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 rounded-xl bg-[#eaf79f] text-black font-bold text-sm hover:bg-white transition"
                  >
                    {submitting ? 'Registering...' : 'Register Profile in TROS'}
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
