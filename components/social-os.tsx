'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, CalendarDays, CheckCircle2, Eye, Inbox, ImagePlus, Plus, Send, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react'

type Analytics = { impressions: number; likes: number; comments: number; shares: number; clicks: number }
type Post = { id: string; platform: string; caption: string; hashtags: string | null; imagePrompt: string | null; imageUrl: string | null; scheduledAt: string | null; publishedAt?: string | null; status: string; analytics?: Analytics | null }
type Session = { platform: string; status: string; accountName: string | null }
const platforms = ['linkedin', 'instagram', 'threads']

export function SocialOS({ view = 'calendar' }: { view?: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [platform, setPlatform] = useState('linkedin')
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [imagePrompt, setImagePrompt] = useState('')
  const [automation, setAutomation] = useState(false)
  const [niches, setNiches] = useState('')
  const [days, setDays] = useState('MON,TUE,WED,THU,FRI')
  const [postsPerDay, setPostsPerDay] = useState(1)
  const [selected, setSelected] = useState<Post | null>(null)
  const [message, setMessage] = useState('')

  async function load() {
    const [postResponse, sessionResponse, automationResponse] = await Promise.all([fetch('/api/social/posts'), fetch('/api/social/sessions'), fetch('/api/social/automation')])
    const [postData, sessionData, automationData] = await Promise.all([postResponse.json(), sessionResponse.json(), automationResponse.json()])
    setPosts(Array.isArray(postData) ? postData : [])
    setSessions(sessionData.sessions || [])
    setAutomation(Boolean(automationData.enabled)); setNiches(automationData.niches || ''); setDays(automationData.days || 'MON,TUE,WED,THU,FRI'); setPostsPerDay(Number(automationData.postsPerDay || 1))
  }

  useEffect(() => { void load() }, [])

  async function toggleAutomation() {
    const response = await fetch('/api/social/automation', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: !automation, niches, days, postsPerDay }) })
    const data = await response.json()
    if (response.ok) { setAutomation(data.enabled); setMessage(data.enabled ? 'Automatic publishing is on.' : 'Automatic publishing is paused.') }
  }

  async function saveAutomationPreferences() {
    const response = await fetch('/api/social/automation', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: automation, niches, days, postsPerDay }) })
    setMessage(response.ok ? 'Automation plan saved.' : 'Unable to save automation plan.')
  }

  async function generateImage() {
    if (!imagePrompt.trim()) { setMessage('Describe the visual first.'); return '' }
    const response = await fetch('/api/social/images', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: imagePrompt }) })
    const data = await response.json()
    if (!response.ok) { setMessage(data.error || 'Image generation failed.'); return '' }
    setMessage('Matching visual generated.')
    return data.imageUrl as string
  }

  async function savePost() {
    const imageUrl = imagePrompt.trim() ? await generateImage() : ''
    const result = await fetch('/api/social/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform, caption, hashtags, imagePrompt, imageUrl, scheduledAt: scheduledAt || null }) }).then(response => response.json())
    if (result.id) { setPosts(current => [result, ...current]); setCaption(''); setHashtags(''); setScheduledAt(''); setImagePrompt(''); setMessage(scheduledAt ? 'Post scheduled for automatic publishing.' : 'Draft saved.') }
  }

  async function connectPlatform(platformName: string) {
    const response = await fetch('/api/social/sessions/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: platformName }) })
    const data = await response.json()
    if (!response.ok) return setMessage(data.error || 'Unable to start connection.')
    window.open(data.loginUrl, '_blank', 'noopener,noreferrer')
    setMessage(`${platformName} sign-in opened. Complete the official login, then refresh this page.`)
  }

  const connected = (name: string) => sessions.some(session => session.platform === name && session.status === 'ACTIVE')
  const tabs = [['calendar', 'Calendar', CalendarDays], ['composer', 'Composer', Send], ['analytics', 'Analytics', BarChart3], ['inbox', 'Inbox', Inbox]] as const

  return <div className="space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Social operations</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">{view === 'composer' ? 'Composer' : view === 'analytics' ? 'Analytics' : view === 'inbox' ? 'Inbox' : 'Content calendar'}</h2><p className="mt-2 text-muted-foreground">Create once, generate the visual, then let the schedule publish it.</p></div><button type="button" onClick={toggleAutomation} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${automation ? 'bg-emerald-600 text-white' : 'border border-border bg-card'}`}>{automation ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}Auto-publish {automation ? 'on' : 'off'}</button></div>
    <div className="grid gap-3 sm:grid-cols-4">{tabs.map(([key, label, Icon]) => <Link key={key} href={`/social/${key}`} className={`flex items-center gap-3 rounded-lg border p-4 text-sm ${view === key ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}><Icon className="size-4" /><span>{label}</span></Link>)}</div>
    {view === 'composer' && <section className="grid gap-6 lg:grid-cols-[1fr_320px]"><div className="rounded-xl border border-border bg-card p-6"><div className="mb-5 flex items-center gap-2"><Sparkles className="size-4 text-primary" /><h3 className="font-semibold">Compose an automated post</h3></div><div className="space-y-4"><select value={platform} onChange={event => setPlatform(event.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">{platforms.map(item => <option key={item}>{item}</option>)}</select><textarea value={caption} onChange={event => setCaption(event.target.value)} placeholder="Write a caption for your audience..." className="min-h-32 w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary" /><input value={hashtags} onChange={event => setHashtags(event.target.value)} placeholder="#hashtags" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /><input value={imagePrompt} onChange={event => setImagePrompt(event.target.value)} placeholder="Matching visual: editorial photo of..." className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /><input type="datetime-local" value={scheduledAt} onChange={event => setScheduledAt(event.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /><div className="flex flex-wrap gap-2"><button type="button" onClick={generateImage} className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm"><ImagePlus className="size-4" />Preview visual</button><button type="button" onClick={savePost} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"><Send className="size-4" />{scheduledAt ? 'Schedule post' : 'Save draft'}</button></div>{message && <p className="text-sm text-emerald-500" role="status">{message}</p>}</div></div><div className="rounded-xl border border-border bg-card p-6"><h3 className="font-semibold">Automation status</h3><p className="mt-2 text-sm text-muted-foreground">The schedule uses your niche, days, and daily post count to guide content generation.</p><div className="mt-5 space-y-3"><label className="block text-xs text-muted-foreground">Niches<input value={niches} onChange={event => setNiches(event.target.value)} placeholder="e.g. calm productivity, creator systems" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></label><label className="block text-xs text-muted-foreground">Days<input value={days} onChange={event => setDays(event.target.value)} placeholder="MON,WED,FRI" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></label><label className="block text-xs text-muted-foreground">Posts per day<input type="number" min="1" max="10" value={postsPerDay} onChange={event => setPostsPerDay(Number(event.target.value))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></label><button type="button" onClick={saveAutomationPreferences} className="w-full rounded-md border border-border px-3 py-2 text-sm">Save automation plan</button><button type="button" onClick={toggleAutomation} className={`flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${automation ? 'bg-emerald-600 text-white' : 'border border-border bg-card'}`}>{automation ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}Auto-publish {automation ? 'on' : 'off'}</button><div className="space-y-3">{platforms.map(item => <div key={item} className="flex items-center justify-between rounded-md border border-border p-3"><span className="capitalize">{item}</span>{connected(item) ? <span className="flex items-center gap-1 text-xs text-emerald-500"><CheckCircle2 className="size-3" />Connected</span> : <button type="button" onClick={() => connectPlatform(item)} className="rounded-md border border-primary px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10">Connect</button>}</div>)}</div></div></div></section>}
    {view === 'calendar' && <section className="rounded-xl border border-border bg-card p-5"><div className="flex items-center justify-between"><div><h3 className="font-semibold">Scheduled queue</h3><p className="mt-1 text-sm text-muted-foreground">Posts publish automatically when the toggle is on.</p></div><Link href="/social/composer" className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"><Plus className="size-4" />New post</Link></div><div className="mt-5 space-y-3">{posts.length ? posts.map(post => <PostRow key={post.id} post={post} onSelect={setSelected} />) : <p className="py-10 text-center text-sm text-muted-foreground">No posts scheduled yet.</p>}</div></section>}
    {view === 'analytics' && <section className="grid gap-4 md:grid-cols-2">{posts.map(post => <PostRow key={post.id} post={post} onSelect={setSelected} />)}{!posts.length && <p className="text-sm text-muted-foreground">Publish a post to see per-post analytics.</p>}</section>}
    {view === 'inbox' && <section className="rounded-xl border border-border bg-card p-8 text-center"><Inbox className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 font-medium">Inbox is ready</p><p className="mt-1 text-sm text-muted-foreground">Connect a social session to collect replies and mentions.</p></section>}
    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}><section className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl border border-border bg-card p-6" onClick={event => event.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">{selected.platform} / {selected.status}</p><h3 className="mt-1 text-xl font-semibold">Post analytics</h3></div><button type="button" onClick={() => setSelected(null)} className="text-sm text-muted-foreground">Close</button></div>{selected.imageUrl && <img src={selected.imageUrl} alt="Generated post visual" className="mt-5 aspect-square w-full rounded-lg object-cover" />}<p className="mt-5 text-sm leading-6">{selected.caption}</p><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">{[['Impressions', selected.analytics?.impressions || 0], ['Likes', selected.analytics?.likes || 0], ['Comments', selected.analytics?.comments || 0], ['Shares', selected.analytics?.shares || 0], ['Clicks', selected.analytics?.clicks || 0]].map(([label, value]) => <div key={label as string} className="rounded-lg border border-border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>)}</div></section></div>}
  </div>
}

function PostRow({ post, onSelect }: { post: Post; onSelect: (post: Post) => void }) {
  return <button type="button" onClick={() => onSelect(post)} className="flex w-full items-center gap-4 rounded-lg border border-border p-4 text-left hover:bg-accent"><div className="size-14 shrink-0 overflow-hidden rounded-md bg-muted">{post.imageUrl ? <img src={post.imageUrl} alt="" className="size-full object-cover" /> : <Eye className="m-5 size-4 text-muted-foreground" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-medium capitalize">{post.platform}</span><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{post.status}</span></div><p className="mt-1 truncate text-sm text-muted-foreground">{post.caption}</p><p className="mt-1 text-xs text-muted-foreground">{post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : 'Unscheduled'}</p></div><BarChart3 className="size-4 text-muted-foreground" /></button>
}
