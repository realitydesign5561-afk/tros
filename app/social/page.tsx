'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth-guard'
import { DashboardShell } from '@/components/dashboard-shell'
import { SocialOS } from '@/components/social-os'
import ConnectionsPage from './connections/page'
import CalendarPage from './calendar/page'
import {
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  Key,
  Layers,
  Lock,
  Megaphone,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<'studio' | 'accounts' | 'calendar' | 'queue'>('studio')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const sampleQueue = [
    {
      id: 'q-1',
      platform: 'Instagram',
      handle: '@realitydesign_agency',
      url: 'https://instagram.com',
      date: 'Today · 2:00 PM',
      status: 'Ready for Manual Post',
      caption:
        '✨ Good design is not just what looks good—it is what works. Transform your business with modern AI-automated operations. Link in bio to book an audit.\n\n#DigitalAgency #RealityOS #DesignStrategy',
      media: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'q-2',
      platform: 'LinkedIn',
      handle: 'Reality Design',
      url: 'https://linkedin.com',
      date: 'Tomorrow · 9:30 AM',
      status: 'Ready for Manual Post',
      caption:
        'How we automated 80% of our agency operations without losing the creative human touch. A quick breakdown for founders and digital studio owners 🧵👇',
      media: null,
    },
    {
      id: 'q-3',
      platform: 'Twitter / X',
      handle: '@reality_ops',
      url: 'https://x.com',
      date: 'Friday · 5:00 PM',
      status: 'Draft',
      caption:
        'Calm software systems beat 80-hour hustle chaos every single time. Build your business infrastructure first. #BuildInPublic',
      media: null,
    },
  ]

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <AuthGuard>
      <DashboardShell>
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Header & Manual Login Guarantee Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#141615] to-[#1c201e] border border-white/10 rounded-3xl p-6 text-white shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5" /> Manual Login Mode Active
                </span>
                <span className="text-xs text-white/50">No API developer credentials required</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Social Media Command & Publishing</h1>
              <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-2xl">
                Operate your social channels with total independence. Enter your login details directly to manage accounts, plan content, and publish with one-click copy without developer approvals.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('accounts')}
                className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#eaf79f] transition flex items-center gap-1.5 shadow-md"
              >
                <Key className="size-3.5" />
                Manage Login Credentials
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'studio'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Sparkles className="size-4 text-[#eaf79f]" />
              AI Content Creator
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'accounts'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Key className="size-4 text-emerald-400" />
              Manual Accounts (No API)
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Calendar className="size-4 text-sky-400" />
              30-Day Content Calendar
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'queue'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Share2 className="size-4 text-purple-400" />
              Manual Publishing Queue
            </button>
          </div>

          {/* Tab Views */}
          {activeTab === 'studio' && (
            <div className="bg-[#141615] rounded-3xl border border-white/10 p-2 sm:p-6 shadow-sm">
              <SocialOS />
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="bg-[#141615] rounded-3xl border border-white/10 p-2 sm:p-6 shadow-sm">
              <ConnectionsPage />
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-[#141615] rounded-3xl border border-white/10 p-2 sm:p-6 shadow-sm text-white">
              <CalendarPage />
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="bg-[#141615] rounded-3xl border border-white/10 p-6 shadow-sm text-white space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Manual One-Click Publishing Queue</h2>
                  <p className="text-xs text-white/60 mt-1">
                    No API hurdles: Click &quot;Copy Caption&quot;, tap &quot;Open Platform&quot;, and paste directly into your logged-in social account.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {sampleQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row gap-5 items-start justify-between"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-[#eaf79f]">{item.platform}</span>
                        <span className="text-xs text-white/50">{item.handle}</span>
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/80">
                          {item.date}
                        </span>
                      </div>
                      <p className="text-sm text-white/90 whitespace-pre-line bg-black/30 p-3.5 rounded-xl border border-white/5 font-sans">
                        {item.caption}
                      </p>
                    </div>

                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleCopy(item.caption, item.id)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          copiedId === item.id
                            ? 'bg-emerald-500 text-black'
                            : 'bg-white text-black hover:bg-[#eaf79f]'
                        }`}
                      >
                        {copiedId === item.id ? (
                          <>
                            <CheckCircle2 className="size-3.5" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" /> Copy Caption
                          </>
                        )}
                      </button>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center gap-1.5 border border-white/10"
                      >
                        <ExternalLink className="size-3.5" /> Open {item.platform}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  )
}
