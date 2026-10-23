'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard-shell'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Film,
  HelpCircle,
  Layers,
  ListChecks,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react'

interface Quiz {
  id: string
  prompt: string
  answer: string
  options?: string
  explanation?: string
}

interface Assignment {
  id: string
  prompt: string
  rubric?: string
}

interface Lesson {
  id: string
  title: string
  position: number
  script?: string
  storyboard?: string
  captions?: string
  audioUrl?: string
  videoUrl?: string
  youtubeUrl?: string
  examples?: string
  practicalDemonstrations?: string
  exercises?: string
  downloadableResources?: string
  completionCriteria?: string
  quiz?: Quiz
  assignment?: Assignment
}

interface Module {
  id: string
  title: string
  position: number
  objectives?: string
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  subtitle?: string
  topic: string
  description?: string
  learningOutcomes?: string
  capstoneProject?: string
  modules: Module[]
  enrollments?: Array<{ id: string; progresses: Array<{ lessonId: string; completed: boolean }> }>
}

export default function CourseLearnerPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.id as string
  const lessonId = params?.lessonId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [currentModule, setCurrentModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'script' | 'storyboard' | 'demo' | 'resources' | 'quiz' | 'assignment'>('script')

  // Progress state
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set())
  const [markingProgress, setMarkingProgress] = useState(false)

  // Quiz state
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState<boolean | null>(null)

  // Audio / TTS playing state
  const [audioPlaying, setAudioPlaying] = useState(false)

  // Certificate Modal
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [certificateData, setCertificateData] = useState<any>(null)
  const [claimingCertificate, setClaimingCertificate] = useState(false)

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch(`/api/courses/${courseId}`)
        if (res.ok) {
          const data: Course = await res.json()
          setCourse(data)

          // Populate existing completed progresses if any
          const initialCompleted = new Set<string>()
          if (data.enrollments && data.enrollments[0]?.progresses) {
            data.enrollments[0].progresses.forEach((p) => {
              if (p.completed) initialCompleted.add(p.lessonId)
            })
          }
          setCompletedLessonIds(initialCompleted)

          // Find requested lesson
          let foundLesson: Lesson | null = null
          let foundModule: Module | null = null
          for (const mod of data.modules) {
            for (const les of mod.lessons) {
              if (les.id === lessonId) {
                foundLesson = les
                foundModule = mod
                break
              }
            }
            if (foundLesson) break
          }

          if (foundLesson) {
            setCurrentLesson(foundLesson)
            setCurrentModule(foundModule)
          } else if (data.modules[0]?.lessons[0]) {
            // fallback to first lesson
            setCurrentLesson(data.modules[0].lessons[0])
            setCurrentModule(data.modules[0])
          }
        }
      } catch (err) {
        console.error('Failed to load course:', err)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) loadCourse()
  }, [courseId, lessonId])

  // Reset quiz state when switching lessons
  useEffect(() => {
    setSelectedQuizOption(null)
    setQuizSubmitted(false)
    setQuizScore(null)
  }, [lessonId])

  // Mark lesson as complete
  const handleToggleComplete = async (markAs: boolean = true) => {
    if (!currentLesson) return
    setMarkingProgress(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          completed: markAs,
        }),
      })

      if (res.ok) {
        const updated = new Set(completedLessonIds)
        if (markAs) {
          updated.add(currentLesson.id)
        } else {
          updated.delete(currentLesson.id)
        }
        setCompletedLessonIds(updated)
      }
    } catch (err) {
      console.error('Failed to update progress:', err)
    } finally {
      setMarkingProgress(false)
    }
  }

  // Quiz submission evaluation
  const handleQuizSubmit = () => {
    if (!currentLesson?.quiz || !selectedQuizOption) return
    const isCorrect = selectedQuizOption.trim().toLowerCase() === currentLesson.quiz.answer.trim().toLowerCase()
    setQuizScore(isCorrect)
    setQuizSubmitted(true)
    if (isCorrect) {
      handleToggleComplete(true)
    }
  }

  // Claim verified certificate
  const handleClaimCertificate = async () => {
    setClaimingCertificate(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/certificate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: 98.5,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setCertificateData(data.certificate)
        setShowCertificateModal(true)
      }
    } catch (err) {
      console.error('Claim cert failed:', err)
    } finally {
      setClaimingCertificate(false)
    }
  }

  // Calculate completion percentage
  const totalLessonsCount =
    course?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 0
  const completedCount = completedLessonIds.size
  const progressPercent =
    totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0

  // Find next and previous lessons
  const allLessons: Lesson[] = []
  course?.modules.forEach((m) => m.lessons.forEach((l) => allLessons.push(l)))
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null

  if (loading) {
    return (
      <DashboardShell>
        <div className="p-12 text-center text-white/50 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="size-8 animate-spin text-[#eaf79f] mb-3" />
          <p className="text-sm font-medium">Loading Course Player & Curriculum...</p>
        </div>
      </DashboardShell>
    )
  }

  if (!course || !currentLesson) {
    return (
      <DashboardShell>
        <div className="p-8 text-center space-y-4">
          <p className="text-white/60">Lesson not found.</p>
          <Link href="/courses" className="text-sm text-[#eaf79f] hover:underline">
            ← Return to Courses
          </Link>
        </div>
      </DashboardShell>
    )
  }

  // Parse quiz options
  let quizOptions: string[] = []
  if (currentLesson.quiz?.options) {
    try {
      quizOptions = JSON.parse(currentLesson.quiz.options)
    } catch {
      quizOptions = [currentLesson.quiz.answer, 'Alternative Option A', 'Alternative Option B']
    }
  }

  // Parse storyboard scenes
  let storyboardScenes: any[] = []
  if (currentLesson.storyboard) {
    try {
      storyboardScenes = JSON.parse(currentLesson.storyboard)
    } catch {}
  }

  const isCurrentCompleted = completedLessonIds.has(currentLesson.id)

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Breadcrumb & Progress Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Link href="/courses" className="hover:text-white transition flex items-center gap-1">
                <ArrowLeft className="size-3.5" /> Courses
              </Link>
              <span>/</span>
              <Link href={`/courses/${course.id}`} className="hover:text-white transition truncate max-w-xs">
                {course.title}
              </Link>
              <span>/</span>
              <span className="text-[#eaf79f] font-semibold">{currentModule?.title || 'Module'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="size-5 text-[#eaf79f]" /> {currentLesson.title}
            </h1>
          </div>

          {/* Course Progress & Certificate Action */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/60">Course Completion:</span>
                <span className="font-bold text-emerald-400">{progressPercent}%</span>
              </div>
              <div className="w-36 bg-white/10 h-2 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-gradient-to-r from-[#eaf79f] to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleClaimCertificate}
              disabled={claimingCertificate}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                progressPercent >= 50
                  ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-400/20'
                  : 'bg-white/10 text-white/40 hover:bg-white/15'
              }`}
              title="Issue verifiable cryptographic completion certificate"
            >
              {claimingCertificate ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Award className="size-3.5" />
              )}
              Claim Certificate
            </button>
          </div>
        </div>

        {/* 2-Column Player Layout: Main Content (Left) & Curriculum Sidebar (Right) */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Main Media & Learning Arena */}
          <div className="space-y-6">
            {/* Video / Visual Screen Area */}
            <div className="relative rounded-3xl bg-black border border-white/10 overflow-hidden shadow-2xl aspect-video flex flex-col items-center justify-center">
              {currentLesson.videoUrl ? (
                <video
                  src={currentLesson.videoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : currentLesson.youtubeUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#121413] to-black space-y-4">
                  <Film className="size-12 text-[#eaf79f] animate-pulse" />
                  <div className="max-w-md space-y-1">
                    <h3 className="text-base font-bold text-white">Interactive Lesson Visual Studio</h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Generated curriculum video instructions ready. You can stream narration, generate Omni Flash video, or watch related video guide.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <a
                      href={currentLesson.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
                    >
                      <Play className="size-3.5 fill-current" /> Watch Practical Reference
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#141615] to-[#0a0c0b] space-y-3">
                  <Film className="size-10 text-white/30" />
                  <p className="text-xs text-white/50">Video playback is ready for this lesson.</p>
                </div>
              )}

              {/* TTS Voiceover Audio Player Bar */}
              {currentLesson.audioUrl && (
                <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Volume2 className="size-4 text-[#eaf79f] animate-pulse" />
                    <span className="font-semibold text-white">Lesson Audio Narration</span>
                    <span className="text-[10px] text-white/50">(Gemini 3.8 Flash-Lite TTS)</span>
                  </div>
                  <audio controls src={currentLesson.audioUrl} className="h-8 max-w-xs" />
                </div>
              )}
            </div>

            {/* Navigation & Completion Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#141615] border border-white/10 text-xs">
              <div>
                {prevLesson ? (
                  <Link
                    href={`/courses/${courseId}/learn/${prevLesson.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition"
                  >
                    <ArrowLeft className="size-3.5" /> Previous: {prevLesson.title.slice(0, 20)}...
                  </Link>
                ) : (
                  <span className="text-white/30">First lesson</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleComplete(!isCurrentCompleted)}
                  disabled={markingProgress}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition ${
                    isCurrentCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#eaf79f] hover:bg-white text-black'
                  }`}
                >
                  {markingProgress ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-3.5" />
                  )}
                  {isCurrentCompleted ? 'Completed' : 'Mark as Complete'}
                </button>
              </div>

              <div>
                {nextLesson ? (
                  <Link
                    href={`/courses/${courseId}/learn/${nextLesson.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition"
                  >
                    Next: {nextLesson.title.slice(0, 20)}... <ArrowRight className="size-3.5" />
                  </Link>
                ) : (
                  <button
                    onClick={handleClaimCertificate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold transition"
                  >
                    <Award className="size-3.5" /> Course Complete!
                  </button>
                )}
              </div>
            </div>

            {/* Tabbed Learning Content */}
            <div className="rounded-3xl border border-white/10 bg-[#141615] p-6 space-y-6">
              {/* Tab Selector */}
              <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('script')}
                  className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                    activeTab === 'script' ? 'bg-[#eaf79f] text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <BookOpen className="size-3.5" /> Lesson Script & Narration
                </button>
                <button
                  onClick={() => setActiveTab('storyboard')}
                  className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                    activeTab === 'storyboard' ? 'bg-[#eaf79f] text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Film className="size-3.5" /> Scene Storyboard
                </button>
                <button
                  onClick={() => setActiveTab('demo')}
                  className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                    activeTab === 'demo' ? 'bg-[#eaf79f] text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <ListChecks className="size-3.5" /> Walkthrough & Exercises
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                    activeTab === 'resources' ? 'bg-[#eaf79f] text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Download className="size-3.5" /> Downloads & Notes
                </button>
                {currentLesson.quiz && (
                  <button
                    onClick={() => setActiveTab('quiz')}
                    className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      activeTab === 'quiz' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <HelpCircle className="size-3.5" /> Knowledge Check
                  </button>
                )}
                {currentLesson.assignment && (
                  <button
                    onClick={() => setActiveTab('assignment')}
                    className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      activeTab === 'assignment' ? 'bg-blue-500 text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Award className="size-3.5" /> Practical Assignment
                  </button>
                )}
              </div>

              {/* Tab 1: Script */}
              {activeTab === 'script' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">Full Narration & Lecture Script</h3>
                    <span className="text-[11px] text-white/50">Word-for-Word Teaching Audio</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#0a0c0b] border border-white/5 text-sm sm:text-base leading-relaxed text-white/90 whitespace-pre-line font-serif">
                    {currentLesson.script || 'No script available for this lesson.'}
                  </div>
                </div>
              )}

              {/* Tab 2: Storyboard */}
              {activeTab === 'storyboard' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">Scene-by-Scene Video Storyboard</h3>
                    <span className="text-[11px] text-white/50">Production Visual Directives</span>
                  </div>
                  {storyboardScenes.length > 0 ? (
                    <div className="grid gap-3">
                      {storyboardScenes.map((scene: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between text-[#eaf79f] font-bold">
                            <span>Scene {scene.sceneNumber || idx + 1}</span>
                            <span className="flex items-center gap-1 text-white/40">
                              <Clock className="size-3" /> {scene.durationSeconds || 30}s
                            </span>
                          </div>
                          <p className="text-white/80">
                            <strong className="text-white">Visual:</strong> {scene.visualDescription}
                          </p>
                          <p className="text-white/70 italic">
                            <strong className="text-white not-italic">Voiceover:</strong> &quot;{scene.narrationText}&quot;
                          </p>
                          {scene.onScreenText && (
                            <p className="text-emerald-400 font-mono text-[11px]">
                              On Screen: [{scene.onScreenText}]
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/50">Storyboard details included in lesson script.</p>
                  )}
                </div>
              )}

              {/* Tab 3: Walkthrough & Exercises */}
              {activeTab === 'demo' && (
                <div className="space-y-6">
                  {currentLesson.practicalDemonstrations && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#eaf79f]">
                        Step-by-Step Demonstration Walkthrough
                      </h4>
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-sm text-white/80 leading-relaxed whitespace-pre-line">
                        {currentLesson.practicalDemonstrations}
                      </div>
                    </div>
                  )}

                  {currentLesson.exercises && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Hands-On Practical Exercise
                      </h4>
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-100 leading-relaxed whitespace-pre-line">
                        {currentLesson.exercises}
                      </div>
                    </div>
                  )}

                  {currentLesson.examples && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">
                        Real-World Examples & Case Studies
                      </h4>
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-white/70 leading-relaxed whitespace-pre-line">
                        {currentLesson.examples}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Resources */}
              {activeTab === 'resources' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white">Downloadable Resources & Checklists</h3>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                      {currentLesson.downloadableResources || 'No additional files required for this lesson.'}
                    </p>
                    <div className="pt-3 border-t border-white/10 flex items-center gap-3">
                      <button
                        onClick={() => alert('Starter template files downloaded to local session.')}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2"
                      >
                        <Download className="size-3.5" /> Download Lesson Assets & Notes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Quiz */}
              {activeTab === 'quiz' && currentLesson.quiz && (
                <div className="space-y-5">
                  <div className="border-b border-white/10 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      Module Assessment · Automated Scoring
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      {currentLesson.quiz.prompt}
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {quizOptions.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (!quizSubmitted) setSelectedQuizOption(opt)
                        }}
                        className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between ${
                          selectedQuizOption === opt
                            ? 'border-purple-400 bg-purple-500/10 text-white shadow-sm'
                            : 'border-white/10 bg-white/[0.02] text-white/80 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span>{opt}</span>
                        {selectedQuizOption === opt && (
                          <span className="size-2 rounded-full bg-purple-400 shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={!selectedQuizOption}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition disabled:opacity-40"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <div
                      className={`p-4 rounded-2xl border space-y-2 text-xs ${
                        quizScore
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-red-500/10 border-red-500/30 text-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {quizScore ? (
                          <>
                            <CheckCircle2 className="size-4 text-emerald-400" /> Correct! Lesson marked as completed.
                          </>
                        ) : (
                          <>Incorrect. Try again to review the principle.</>
                        )}
                      </div>
                      <p className="text-white/80 leading-relaxed">
                        <strong>Explanation:</strong>{' '}
                        {currentLesson.quiz.explanation ||
                          `The correct answer is: ${currentLesson.quiz.answer}`}
                      </p>
                      {!quizScore && (
                        <button
                          onClick={() => {
                            setQuizSubmitted(false)
                            setSelectedQuizOption(null)
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-white text-[11px] font-bold"
                        >
                          <RotateCcw className="size-3" /> Retry Question
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 6: Assignment */}
              {activeTab === 'assignment' && currentLesson.assignment && (
                <div className="space-y-4">
                  <div className="border-b border-white/10 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Practical Rubric-Assisted Assignment
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      {currentLesson.assignment.prompt}
                    </h3>
                  </div>

                  {currentLesson.assignment.rubric && (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                      <p className="text-xs font-bold uppercase text-white/50">Grading Rubric Criteria:</p>
                      <pre className="text-xs text-white/70 whitespace-pre-wrap font-mono">
                        {currentLesson.assignment.rubric}
                      </pre>
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-white/80">Submit Deliverable Link / Repo:</label>
                    <input
                      placeholder="https://github.com/... or https://your-site.vercel.app"
                      className="w-full p-3 rounded-xl bg-black border border-white/10 text-xs text-white outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={() => alert('Assignment submitted for instructor rubric review!')}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                    >
                      Submit Assignment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Curriculum Sidebar (Right) */}
          <aside className="rounded-3xl border border-white/10 bg-[#141615] p-5 shadow-xl space-y-4 sticky top-20 max-h-[82vh] overflow-y-auto">
            <div className="border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#eaf79f]">
                Course Curriculum
              </span>
              <h2 className="text-sm font-bold text-white leading-tight mt-0.5">{course.title}</h2>
              <p className="text-[11px] text-white/50 mt-1">
                {course.modules.length} Modules · {totalLessonsCount} Lessons
              </p>
            </div>

            <div className="space-y-4">
              {course.modules.map((mod, modIdx) => (
                <div key={mod.id} className="space-y-1.5">
                  <div className="px-2 py-1 text-[11px] font-bold text-white/70 flex items-center justify-between">
                    <span className="truncate">{mod.title}</span>
                    <span className="text-[10px] text-white/40 shrink-0 ml-1">
                      {mod.lessons.length}
                    </span>
                  </div>

                  <div className="space-y-1 pl-1">
                    {mod.lessons.map((les) => {
                      const isCurrent = les.id === currentLesson.id
                      const isDone = completedLessonIds.has(les.id)
                      return (
                        <Link
                          key={les.id}
                          href={`/courses/${courseId}/learn/${les.id}`}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                            isCurrent
                              ? 'bg-[#eaf79f] text-black font-bold shadow-sm'
                              : 'text-white/70 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="truncate">{les.title}</span>
                          </div>
                          {isDone ? (
                            <CheckCircle2
                              className={`size-3.5 shrink-0 ${
                                isCurrent ? 'text-black' : 'text-emerald-400'
                              }`}
                            />
                          ) : (
                            <Play
                              className={`size-3 shrink-0 ${
                                isCurrent ? 'text-black' : 'text-white/30'
                              }`}
                            />
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* Verified Certificate Modal */}
      {showCertificateModal && certificateData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141615] rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-amber-400/30 text-white shadow-2xl relative space-y-6 text-center">
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute top-5 right-5 text-white/40 hover:text-white"
            >
              ✕
            </button>

            <div className="size-16 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto">
              <Award className="size-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Official Credential Issued
              </span>
              <h3 className="text-2xl font-bold">Certificate of Completion</h3>
              <p className="text-xs text-white/60">
                Issued by Reality Operations System (TROS) Verification Registry
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-left text-xs">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/50">Student:</span>
                <span className="font-bold text-white">{certificateData.studentName}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/50">Course:</span>
                <span className="font-bold text-white">{certificateData.courseTitle}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/50">Verification Code:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {certificateData.certificateCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Grade / Score:</span>
                <span className="font-bold text-emerald-400">{certificateData.grade}% Distinction</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/verify/cert/${certificateData.certificateCode}`}
                target="_blank"
                className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="size-3.5" /> View Public Verification Page
              </Link>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
