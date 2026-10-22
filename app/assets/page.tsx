'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { AuthGuard } from '@/components/auth-guard'
import {
  Download,
  ExternalLink,
  FileText,
  Filter,
  FolderOpen,
  Image as ImageIcon,
  Plus,
  Search,
  Sparkles,
  Tag,
  Video,
} from 'lucide-react'
import Link from 'next/link'

interface AssetMock {
  id: string
  title: string
  category: 'Flyers' | 'Brand Kits' | 'YouTube' | 'Videos' | 'Blueprints'
  type: string
  resolution: string
  createdAt: string
  tags: string[]
}

const DEFAULT_ASSETS: AssetMock[] = [
  {
    id: 'ast_1',
    title: 'Luxury Gold Foil Birthday Flyer',
    category: 'Flyers',
    type: 'PNG / Layered Vector',
    resolution: '2160x2700 (4:5)',
    createdAt: 'Today',
    tags: ['Birthday', 'Luxury', 'Gold', 'Editorial'],
  },
  {
    id: 'ast_2',
    title: 'Lagos Real Estate Pitch Deck Thumbnail',
    category: 'YouTube',
    type: 'High-CTR JPG',
    resolution: '1920x1080 (16:9)',
    createdAt: 'Yesterday',
    tags: ['Real Estate', 'YouTube', 'High-CTR'],
  },
  {
    id: 'ast_3',
    title: 'Reality Design Primary Brand Guidelines',
    category: 'Brand Kits',
    type: 'PDF & Hex Tokens',
    resolution: 'Vector',
    createdAt: '2 days ago',
    tags: ['Brand Kit', 'Identity', 'Typography'],
  },
  {
    id: 'ast_4',
    title: 'Agency Automation Explainer Narration',
    category: 'Videos',
    type: 'WAV Audio & MP4 Video',
    resolution: '1080x1920 (9:16)',
    createdAt: '3 days ago',
    tags: ['Reels', 'TikTok', 'Voiceover'],
  },
  {
    id: 'ast_5',
    title: 'Enterprise Real Estate Architecture Blueprint',
    category: 'Blueprints',
    type: 'Next.js App Schema',
    resolution: 'Code & DB Spec',
    createdAt: '5 days ago',
    tags: ['Next.js', 'Prisma', 'Tailwind'],
  },
]

export default function AssetsPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  const categories = ['ALL', 'Flyers', 'Brand Kits', 'YouTube', 'Videos', 'Blueprints']

  const filteredAssets = DEFAULT_ASSETS.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchCat = selectedCategory === 'ALL' || a.category === selectedCategory
    return matchSearch && matchCat
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
                  Media & Creative Vault
                </span>
                <span className="text-xs text-white/50">Central Asset Storage</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                <FolderOpen className="size-8 text-[#eaf79f]" /> File & Asset Library
              </h1>
              <p className="mt-1 text-sm text-white/60 max-w-2xl">
                Unified repository for all generated birthday flyers, YouTube thumbnails, brand kit tokens, video reels, and full-stack software blueprints.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/designer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#eaf79f] text-black px-4 py-2.5 text-xs sm:text-sm font-semibold hover:bg-white transition shadow-sm"
              >
                <Plus className="size-4" /> Create in Creative Studio
              </Link>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#141615] p-4 rounded-2xl border border-white/10">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
              <input
                type="text"
                placeholder="Search assets by title or tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 rounded-xl bg-[#0a0c0b] border border-white/10 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-white/40 outline-none focus:border-[#eaf79f]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-[#eaf79f] text-black'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Assets Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="p-6 rounded-3xl border border-white/10 bg-[#121413] hover:border-white/20 transition flex flex-col justify-between space-y-5 group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#eaf79f] bg-[#eaf79f]/10 border border-[#eaf79f]/20 px-2 py-0.5 rounded-full">
                      {asset.category}
                    </span>
                    <span className="text-[11px] font-mono text-white/40">{asset.createdAt}</span>
                  </div>

                  <h3 className="font-bold text-lg text-white mt-3 leading-snug group-hover:text-[#eaf79f] transition-colors">
                    {asset.title}
                  </h3>
                  <p className="text-xs font-mono text-white/50 mt-1">{asset.type} • {asset.resolution}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {asset.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/70"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/40 text-[11px]">Ready for export</span>
                  <button
                    onClick={() => alert(`Exporting ${asset.title} in original resolution.`)}
                    className="inline-flex items-center gap-1.5 text-primary text-[#eaf79f] font-semibold hover:underline"
                  >
                    <Download className="size-3.5" /> Download Asset
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </DashboardShell>
    </AuthGuard>
  )
}
