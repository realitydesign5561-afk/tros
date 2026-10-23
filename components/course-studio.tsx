'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Film,
  Layers,
  Loader2,
  Play,
  Plus,
  Sparkles,
  Zap,
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
}

interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  subtitle?: string
  topic: string
  description?: string
  price?: number
  status: string
  modules: Module[]
  certificates?: any[]
  enrollments?: any[]
}

const PRESET_TOPICS = [
  {
    title: 'Modern Web Design with AI',
    prompt: 'Create a complete course on how to become a web designer using AI.',
    audience: 'Beginners',
    format: 'self-paced',
  },
  {
    title: 'AI Business Automation & Agency OS',
    prompt: 'Create a comprehensive masterclass on operating an AI business agency using TROS and automated workflows.',
    audience: 'Intermediate',
    format: 'masterclass',
  },
  {
    title: 'Faceless YouTube Content OS',
    prompt: 'Create an intensive course on launching and scaling a faceless YouTube channel with AI video generators and voiceovers.',
    audience: 'Beginners',
    format: 'cohort',
  },
]

export function CourseStudio({ createMode = false }: { createMode?: boolean }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [topic, setTopic] = useState('')
  const [prompt, setPrompt] = useState('')
  const [format, setFormat] = useState('self-paced')
  const [audience, setAudience] = useState('beginners')
  const [loading, setLoading] = useState(false)
  const [generationStep, setGenerationStep] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => (res.ok ? res.json() : []))
      .then(setCourses)
  }, [])

  async function createCourse(event?: React.FormEvent, customTopic?: string, customPrompt?: string) {
    if (event) event.preventDefault()
    const targetTopic = customTopic || topic
    const targetPrompt = customPrompt || prompt
    if (!targetTopic.trim()) return

    setLoading(true)
    setNotice('')
    setGenerationStep('Planning prerequisites, learner persona, and 12-stage curriculum...')

    const stepTimer1 = setTimeout(() => {
      setGenerationStep('Synthesizing detailed lesson scripts, step-by-step demonstrations, and exercises...')
    }, 2500)

    const stepTimer2 = setTimeout(() => {
      setGenerationStep('Generating knowledge checks, rubrics, capstone brief, and sales launch copy...')
    }, 5500)

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          prompt: targetPrompt,
          format,
          audience,
        }),
      })

      clearTimeout(stepTimer1)
      clearTimeout(stepTimer2)

      const data = await res.json()
      if (!res.ok) {
        setNotice(data.error ?? 'Unable to create course')
      } else {
        setCourses((current) => [data, ...current])
        setTopic('')
        setPrompt('')
        setNotice(`Course "${data.title}" successfully created with ${data.modules?.length || 12} modules!`)
      }
    } catch {
      setNotice('Network error during course creation.')
    } finally {
      setLoading(false)
      setGenerationStep('')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#eaf79f]/20 text-[#eaf79f] px-2.5 py-0.5 rounded-full border border-[#eaf79f]/30 flex items-center gap-1.5">
              <Sparkles className="size-3" /> AI Course Creation Studio
            </span>
            <span className="text-xs text-white/50">Prompt-to-Execution Curriculum Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Build Knowledge That Ships.
          </h1>
          <p className="mt-1 text-sm text-white/60 max-w-2xl leading-relaxed">
            Describe a course in natural language. TROS coordinates the Course Planning Agent, Lesson Script Generator, Video Production Pipeline, and Assessment Engine into a full 12-stage curriculum with verifiable credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!createMode && (
            <Link
              href="/courses/create"
              className="inline-flex items-center gap-2 rounded-xl bg-[#eaf79f] text-black px-4 py-2.5 text-xs sm:text-sm font-bold hover:bg-white transition shadow-sm"
            >
              <Plus className="size-4" /> Create Course
            </Link>
          )}
        </div>
      </div>

      {/* Preset Directive Buttons */}
      <div className="rounded-3xl border border-white/10 bg-[#141615] p-5 space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#eaf79f] flex items-center gap-1.5">
          <Zap className="size-3.5" /> Quick Launch Pre-Engineered Directives:
        </span>
        <div className="grid sm:grid-cols-3 gap-3">
          {PRESET_TOPICS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              disabled={loading}
              onClick={() => {
                setTopic(preset.title)
                setPrompt(preset.prompt)
                createCourse(undefined, preset.title, preset.prompt)
              }}
              className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#eaf79f]/30 transition text-left group space-y-1 disabled:opacity-50"
            >
              <p className="text-xs font-bold text-white group-hover:text-[#eaf79f] transition flex items-center justify-between">
                <span>{preset.title}</span>
                <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">
                {preset.prompt}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Course Generator Form (Active in createMode or when triggered) */}
      {createMode && (
        <form
          onSubmit={(e) => createCourse(e)}
          className="rounded-3xl border border-white/10 bg-[#141615] p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[#eaf79f]" />
              <h3 className="text-base font-bold text-white">Full-Featured AI Course Generator</h3>
            </div>
            <span className="text-xs text-white/50">12-Stage Comprehensive Architecture</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <input
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. AI Web Design"
              className="min-h-12 rounded-xl border border-white/10 bg-[#0a0c0b] px-4 text-xs sm:text-sm text-white placeholder:text-white/30 outline-none focus:border-[#eaf79f]"
            />

            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="min-h-12 rounded-xl border border-white/10 bg-[#0a0c0b] px-3 text-xs sm:text-sm text-white"
            >
              <option value="self-paced">Format: Self-Paced Masterclass</option>
              <option value="cohort">Format: Cohort-Based</option>
              <option value="masterclass">Format: Intensive Bootcamp</option>
            </select>

            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="min-h-12 rounded-xl border border-white/10 bg-[#0a0c0b] px-3 text-xs sm:text-sm text-white"
            >
              <option value="beginners">Audience: Beginners (No Code)</option>
              <option value="intermediate">Audience: Intermediate Freelancers</option>
              <option value="advanced">Audience: Agency Directors</option>
            </select>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the desired curriculum, outcomes, special tool focus (e.g. 'Create a complete beginner course on web design using AI covering HTML/CSS basics, prompt engineering for UI, responsive grids, asset generation, client handover, and portfolio capstone.')"
            rows={3}
            className="w-full rounded-2xl border border-white/10 bg-[#0a0c0b] p-4 text-xs sm:text-sm text-white placeholder:text-white/30 outline-none focus:border-[#eaf79f] resize-none leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              <span>Generates full scripts, storyboards, quizzes, rubrics, and sales landing page</span>
            </div>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#eaf79f] text-black px-6 py-3 text-xs sm:text-sm font-bold hover:bg-white transition disabled:opacity-50 shadow-md shadow-[#eaf79f]/10"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Orchestrating Course Agents...
                </>
              ) : (
                <>
                  <Zap className="size-4" /> Generate Complete 12-Stage Course
                </>
              )}
            </button>
          </div>

          {loading && generationStep && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#eaf79f] flex items-center gap-2 animate-pulse">
              <Loader2 className="size-3.5 animate-spin shrink-0" />
              <span>{generationStep}</span>
            </div>
          )}

          {notice && (
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/90 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>{notice}</span>
            </div>
          )}
        </form>
      )}

      {/* Courses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="size-4 text-[#eaf79f]" /> Active Course Catalog ({courses.length})
          </h2>
          <span className="text-xs text-white/50">Persistent PostgreSQL Storage</span>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center space-y-3">
            <Clock3 className="size-8 text-white/30 mx-auto" />
            <h3 className="text-sm font-bold text-white">No courses created yet</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              Click a preset directive above or describe your curriculum to generate your first complete masterclass.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((c) => {
              const firstLessonId = c.modules?.[0]?.lessons?.[0]?.id
              const totalLessons = c.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 0

              return (
                <div
                  key={c.id}
                  className="rounded-3xl border border-white/10 bg-[#141615] p-5 flex flex-col justify-between space-y-4 hover:border-[#eaf79f]/40 transition shadow-xl group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="size-10 rounded-xl bg-[#eaf79f]/10 text-[#eaf79f] flex items-center justify-center font-bold">
                        <BookOpen className="size-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                          {c.status}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          ${c.price || 149}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-[#eaf79f] transition line-clamp-1">
                        {c.title}
                      </h3>
                      <p className="text-xs text-white/60 line-clamp-2 mt-1 leading-relaxed">
                        {c.subtitle || c.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-white/40 pt-1">
                      <span>{c.modules?.length || 0} Modules</span>
                      <span>·</span>
                      <span>{totalLessons} Lessons</span>
                      <span>·</span>
                      <span className="text-amber-400 flex items-center gap-1">
                        <Award className="size-3" /> Verifiable Cert
                      </span>
                    </div>
                  </div>

                  {/* Actions Hub */}
                  <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                    <Link
                      href={`/courses/${c.id}`}
                      className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition flex items-center justify-center gap-1"
                      title="Edit curriculum and generate videos"
                    >
                      Studio
                    </Link>

                    {firstLessonId && (
                      <Link
                        href={`/courses/${c.id}/learn/${firstLessonId}`}
                        className="py-2 rounded-xl bg-[#eaf79f] text-black hover:bg-white transition flex items-center justify-center gap-1"
                        title="Learner portal and video player"
                      >
                        <Play className="size-3 fill-current" /> Learn
                      </Link>
                    )}

                    <Link
                      href={`/courses/${c.id}/landing`}
                      className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition flex items-center justify-center gap-1"
                      title="Public sales page and checkout"
                    >
                      Sales <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
