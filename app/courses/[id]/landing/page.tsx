'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardShell } from '@/components/dashboard-shell'
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Film,
  Globe2,
  HelpCircle,
  Layers,
  Loader2,
  Play,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'

export default function CourseSalesLandingPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.id as string

  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0)
  const [enrolling, setEnrolling] = useState(false)
  const [enrolledSuccess, setEnrolledSuccess] = useState(false)

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch(`/api/courses/${courseId}`)
        if (res.ok) {
          const data = await res.json()
          setCourse(data)
        }
      } catch (err) {
        console.error('Failed to load course landing:', err)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) loadCourse()
  }, [courseId])

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (res.ok) {
        setEnrolledSuccess(true)
        // Redirect to first lesson after brief confirmation
        const firstLessonId = course?.modules?.[0]?.lessons?.[0]?.id
        setTimeout(() => {
          if (firstLessonId) {
            router.push(`/courses/${courseId}/learn/${firstLessonId}`)
          } else {
            router.push(`/courses/${courseId}`)
          }
        }, 1200)
      }
    } catch (err) {
      console.error('Enrollment error:', err)
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="p-12 text-center text-white/50 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="size-8 animate-spin text-[#eaf79f] mb-3" />
          <p className="text-sm">Loading Sales Landing Page...</p>
        </div>
      </DashboardShell>
    )
  }

  if (!course) {
    return (
      <DashboardShell>
        <div className="p-8 text-center space-y-4">
          <p className="text-white/60">Course not found.</p>
          <Link href="/courses" className="text-sm text-[#eaf79f] hover:underline">
            ← Return to Courses
          </Link>
        </div>
      </DashboardShell>
    )
  }

  // Parse JSON fields
  let learningOutcomes: string[] = []
  if (course.learningOutcomes) {
    try {
      learningOutcomes = JSON.parse(course.learningOutcomes)
    } catch {
      learningOutcomes = [course.learningOutcomes]
    }
  }

  let faqs: Array<{ question: string; answer: string }> = []
  if (course.faqs) {
    try {
      faqs = JSON.parse(course.faqs)
    } catch {}
  }

  let capstone: any = null
  if (course.capstoneProject) {
    try {
      capstone = JSON.parse(course.capstoneProject)
    } catch {}
  }

  const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto space-y-16 pb-16">
        {/* Top Control Bar for Course Creator */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#141615] border border-white/10 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400" />
            <span>Public Sales Page Preview · Live & Ready to Sell</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/courses/${course.id}`}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition"
            >
              Open Studio Editor
            </Link>
            {firstLessonId && (
              <Link
                href={`/courses/${course.id}/learn/${firstLessonId}`}
                className="px-3 py-1.5 rounded-xl bg-[#eaf79f] text-black font-bold hover:bg-white transition flex items-center gap-1"
              >
                <Play className="size-3 fill-current" /> Learner Player
              </Link>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <section className="text-center space-y-6 pt-4 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eaf79f]/10 border border-[#eaf79f]/30 text-[#eaf79f] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="size-3.5" /> High-Performance AI Masterclass
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            {course.salesHeadline || course.title}
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            {course.subtitle || course.description}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleEnroll}
              disabled={enrolling || enrolledSuccess}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#eaf79f] hover:bg-white text-black text-base font-extrabold transition shadow-xl shadow-[#eaf79f]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {enrolling ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Enrolling You...
                </>
              ) : enrolledSuccess ? (
                <>
                  <CheckCircle2 className="size-5 text-emerald-600" /> Enrolled! Launching...
                </>
              ) : (
                <>
                  <Zap className="size-5" /> Enroll in Masterclass · ${course.price || 149}
                </>
              )}
            </button>

            {firstLessonId && (
              <Link
                href={`/courses/${course.id}/learn/${firstLessonId}`}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold border border-white/10 transition flex items-center justify-center gap-2"
              >
                <BookOpen className="size-4 text-[#eaf79f]" /> Preview Curriculum
              </Link>
            )}
          </div>

          {/* Social Proof Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <Check className="size-4 text-emerald-400" /> Verifiable Certificate Included
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-4 text-emerald-400" /> Full 12-Stage Curriculum
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-4 text-emerald-400" /> Lifetime Access & Updates
            </span>
          </div>
        </section>

        {/* Video Teaser / Artwork Banner */}
        <section className="rounded-3xl bg-black border border-white/10 overflow-hidden shadow-2xl relative aspect-video flex items-center justify-center">
          {course.coverImageUrl ? (
            <img
              src={course.coverImageUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-8 text-center max-w-lg space-y-3">
              <div className="size-16 rounded-full bg-[#eaf79f]/20 text-[#eaf79f] flex items-center justify-center mx-auto shadow-inner">
                <Film className="size-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Promotional Video Teaser</h3>
              <p className="text-xs text-white/60 leading-relaxed font-mono">
                {course.promoVideoPrompt || 'Cinematic 3D demonstration of modern AI web design workflow.'}
              </p>
            </div>
          )}
        </section>

        {/* Persuasive Pitch */}
        {course.salesPitch && (
          <section className="rounded-3xl border border-white/10 bg-[#141615] p-8 sm:p-10 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#eaf79f]">
              Why This Masterclass Exists
            </span>
            <div className="text-base sm:text-lg leading-relaxed text-white/90 whitespace-pre-line space-y-4">
              {course.salesPitch}
            </div>
          </section>
        )}

        {/* Learning Outcomes Grid */}
        {learningOutcomes.length > 0 && (
          <section className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                What You Will Build & Master
              </h2>
              <p className="text-sm text-white/60">
                Direct, measurable competencies you gain throughout the 12 modules.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {learningOutcomes.map((outcome, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#141615] border border-white/10 flex items-start gap-3.5"
                >
                  <div className="size-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <p className="text-sm text-white/90 font-medium leading-relaxed">
                    {outcome}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 12-Stage Curriculum Accordion */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#eaf79f]">
              Complete Curriculum Progression
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Inside the 12 Modules
            </h2>
            <p className="text-sm text-white/60">
              Every lesson includes full scripts, video demonstrations, interactive quizzes, and exercises.
            </p>
          </div>

          <div className="space-y-3">
            {course.modules.map((mod: any, idx: number) => {
              const isOpen = openModuleIndex === idx
              return (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-white/10 bg-[#141615] overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenModuleIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#eaf79f]">
                          Stage {idx + 1}
                        </span>
                        <h3 className="text-base font-bold text-white">{mod.title}</h3>
                      </div>
                      {mod.objectives && (
                        <p className="text-xs text-white/60 line-clamp-1">{mod.objectives}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-white/40">
                        {mod.lessons.length} {mod.lessons.length === 1 ? 'lesson' : 'lessons'}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="size-4 text-white/60" />
                      ) : (
                        <ChevronDown className="size-4 text-white/60" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 border-t border-white/5 space-y-2">
                      {mod.lessons.map((les: any, lesIdx: number) => (
                        <div
                          key={les.id}
                          className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <Play className="size-3.5 text-[#eaf79f]" />
                            <span className="font-semibold text-white/90">
                              {lesIdx + 1}. {les.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-white/50">
                            {les.quiz && (
                              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                                Quiz
                              </span>
                            )}
                            {les.assignment && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                                Rubric
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" /> ~6 min
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Capstone Project Showcase */}
        {capstone && (
          <section className="rounded-3xl border border-amber-400/30 bg-gradient-to-br from-[#1c1811] via-[#141615] to-[#0a0c0b] p-8 sm:p-10 space-y-5">
            <div className="flex items-center gap-2">
              <Award className="size-6 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Final Portfolio Capstone Project
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white">{capstone.title}</h3>
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
              {capstone.brief}
            </p>
            {capstone.deliverables && (
              <div className="pt-2 space-y-2">
                <p className="text-xs font-bold text-white/60 uppercase">Required Deliverables:</p>
                <div className="grid sm:grid-cols-3 gap-2">
                  {capstone.deliverables.map((del: string, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white/90 flex items-center gap-2"
                    >
                      <Check className="size-3.5 text-amber-400 shrink-0" />
                      <span>{del}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Instructor Bio */}
        {course.instructorBio && (
          <section className="rounded-3xl border border-white/10 bg-[#141615] p-8 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#eaf79f]">
              Instructor Profile
            </span>
            <h3 className="text-lg font-bold text-white">Reality Design Operations Studio</h3>
            <p className="text-sm text-white/70 leading-relaxed">{course.instructorBio}</p>
          </section>
        )}

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <section className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
              <p className="text-xs text-white/60">Everything you need to know before enrolling.</p>
            </div>

            <div className="grid gap-3">
              {faqs.map((faq, i) => (
                <div key={i} className="p-5 rounded-2xl bg-[#141615] border border-white/10 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="size-4 text-[#eaf79f]" /> {faq.question}
                  </h4>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed pl-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA Banner */}
        <section className="rounded-3xl bg-gradient-to-r from-[#1a1e1b] via-[#141615] to-[#121413] border border-[#eaf79f]/30 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Build Agency-Grade Web Projects with AI?
          </h2>
          <p className="text-sm text-white/70 max-w-xl mx-auto">
            Get instant lifetime access to all 12 modules, lesson scripts, video guides, downloadable assets, and your verifiable completion certificate.
          </p>
          <button
            onClick={handleEnroll}
            disabled={enrolling || enrolledSuccess}
            className="px-10 py-4 rounded-2xl bg-[#eaf79f] hover:bg-white text-black font-extrabold text-base transition shadow-xl shadow-[#eaf79f]/20"
          >
            {enrolling ? 'Enrolling...' : enrolledSuccess ? 'Enrolled!' : `Enroll Now for $${course.price || 149}`}
          </button>
        </section>
      </div>
    </DashboardShell>
  )
}
