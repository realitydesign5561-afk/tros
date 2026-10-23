'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Film,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  ListChecks,
  Loader2,
  Mic,
  Play,
  PlayCircle,
  Save,
  Sparkles,
  Volume2,
  Zap,
} from 'lucide-react'
import { DashboardShell } from '@/components/dashboard-shell'

interface Quiz {
  id?: string
  prompt: string
  answer: string
  options?: string
  explanation?: string
}

interface Lesson {
  id: string
  title: string
  youtubeUrl?: string
  script?: string
  storyboard?: string
  captions?: string
  audioUrl?: string
  videoUrl?: string
  videoStatus?: string
  status?: string
  examples?: string
  practicalDemonstrations?: string
  exercises?: string
  downloadableResources?: string
  completionCriteria?: string
  quiz?: Quiz
}

interface Module {
  id: string
  title: string
  position: number
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  subtitle?: string
  description?: string
  price?: number
  coverImageUrl?: string
  salesHeadline?: string
  modules: Module[]
}

export default function CourseStudioDetailPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [selected, setSelected] = useState<Lesson | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [activeTab, setActiveTab] = useState<'script' | 'storyboard' | 'practical' | 'quiz' | 'media'>('script')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [generatingAsset, setGeneratingAsset] = useState<string | null>(null)

  // Voice selection
  const [voiceName, setVoiceName] = useState<'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr'>('Kore')

  useEffect(() => {
    fetch(`/api/courses/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setCourse(data)
          setSelected(data?.modules?.[0]?.lessons?.[0] ?? null)
          setSelectedModule(data?.modules?.[0] ?? null)
        }
      })
  }, [params.id])

  async function saveLesson() {
    if (!selected || !course) return
    setSaving(true)
    setNotice('')
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: selected.id,
          youtubeUrl: selected.youtubeUrl,
          script: selected.script,
          storyboard: selected.storyboard,
          captions: selected.captions,
          examples: selected.examples,
          practicalDemonstrations: selected.practicalDemonstrations,
          exercises: selected.exercises,
          downloadableResources: selected.downloadableResources,
          quiz: selected.quiz,
          status: 'READY',
        }),
      })

      if (res.ok) {
        setNotice('Lesson and assessments saved successfully.')
      } else {
        setNotice('Failed to save lesson changes.')
      }
    } catch {
      setNotice('Network error saving lesson.')
    } finally {
      setSaving(false)
    }
  }

  // Trigger Gemini AI generation for Video, Voiceover TTS, or Cover Art
  async function generateAsset(type: 'VOICEOVER' | 'VIDEO' | 'COVER_ART') {
    if (!course) return
    setGeneratingAsset(type)
    setNotice('')

    try {
      const res = await fetch(`/api/courses/${course.id}/generate-asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetType: type,
          lessonId: selected?.id,
          prompt:
            type === 'VOICEOVER'
              ? selected?.script?.slice(0, 500)
              : type === 'VIDEO'
              ? `Demonstration video for lesson: ${selected?.title} in ${course.title}. High quality UI web design layout, clean lighting.`
              : `Cover banner for course: ${course.title}`,
          voiceName,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        if (type === 'VOICEOVER' && data.audioUrl && selected) {
          setSelected({ ...selected, audioUrl: data.audioUrl })
          setNotice('Voiceover synthesized with gemini-3.8-flash-lite-tts!')
        } else if (type === 'VIDEO' && data.videoUrl && selected) {
          setSelected({ ...selected, videoUrl: data.videoUrl, videoStatus: 'READY' })
          setNotice('Video generated with gemini-omni-1.1-flash!')
        } else if (type === 'COVER_ART' && data.imageUrl) {
          setCourse({ ...course, coverImageUrl: data.imageUrl })
          setNotice('2K Cover artwork generated with gemini-nano-banana-2.1!')
        }
      } else {
        setNotice(data.error || 'Asset generation failed.')
      }
    } catch (err: any) {
      setNotice(err?.message || 'Error executing AI generation.')
    } finally {
      setGeneratingAsset(null)
    }
  }

  if (!course) {
    return (
      <DashboardShell>
        <div className="p-12 text-center text-white/50 flex flex-col items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#eaf79f] mb-3" />
          <p className="text-sm">Loading course studio...</p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition"
            >
              <ArrowLeft className="size-3.5" /> Back to All Courses
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-[#eaf79f]/20 text-[#eaf79f] px-2 py-0.5 rounded-full border border-[#eaf79f]/30">
                Course Studio Editor
              </span>
              <span className="text-xs text-white/50">12-Stage Curriculum Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <BookOpen className="size-6 text-[#eaf79f]" /> {course.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {selected && (
              <Link
                href={`/courses/${course.id}/learn/${selected.id}`}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Play className="size-3.5 fill-current" /> Learner Player
              </Link>
            )}

            <Link
              href={`/courses/${course.id}/landing`}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <ExternalLink className="size-3.5" /> Sales Landing Page
            </Link>

            <button
              onClick={() => generateAsset('COVER_ART')}
              disabled={Boolean(generatingAsset)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition flex items-center gap-1.5"
              title="Generate 2K cover banner with Gemini Nano Banana"
            >
              {generatingAsset === 'COVER_ART' ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <ImageIcon className="size-3.5 text-[#eaf79f]" />
              )}
              Generate 2K Cover
            </button>

            <button
              onClick={saveLesson}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#eaf79f] text-black px-4 py-2 text-xs font-bold hover:bg-white transition shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save Changes
            </button>
          </div>
        </div>

        {notice && (
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/90 flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* 2-Column Studio Grid: Left Sidebar Curriculum, Right Editor */}
        <div className="grid gap-6 lg:grid-cols-[290px_1fr] items-start">
          {/* Curriculum Sidebar */}
          <aside className="rounded-3xl border border-white/10 bg-[#141615] p-4 shadow-xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#eaf79f]">
                Curriculum Navigator
              </span>
              <p className="text-xs text-white/50 mt-0.5">
                {course.modules.length} Modules · Complete Progression
              </p>
            </div>

            <div className="space-y-4">
              {course.modules.map((mod, modIdx) => (
                <div key={mod.id} className="space-y-1">
                  <p className="px-2 text-xs font-bold text-white/70">
                    {modIdx + 1}. {mod.title}
                  </p>
                  <div className="space-y-0.5 mt-1">
                    {mod.lessons.map((lesson) => {
                      const isSelected = selected?.id === lesson.id
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            setSelected(lesson)
                            setSelectedModule(mod)
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition ${
                            isSelected
                              ? 'bg-[#eaf79f] text-black font-bold shadow-sm'
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <PlayCircle className="size-3.5 shrink-0" />
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          {lesson.videoUrl && (
                            <Film className={`size-3 shrink-0 ${isSelected ? 'text-black' : 'text-emerald-400'}`} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Lesson & Production Workspace */}
          <section className="rounded-3xl border border-white/10 bg-[#141615] p-6 shadow-xl space-y-6">
            {selected ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">
                      {selectedModule?.title || 'Module'} · Lesson Editor
                    </span>
                    <input
                      value={selected.title}
                      onChange={(e) => setSelected({ ...selected, title: e.target.value })}
                      className="text-lg sm:text-xl font-bold text-white bg-transparent outline-none w-full border-b border-transparent focus:border-[#eaf79f]"
                    />
                  </div>

                  {/* AI Video Production Hub */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={voiceName}
                      onChange={(e) => setVoiceName(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-xl bg-black border border-white/10 text-xs text-white"
                      title="TTS Voice Profile"
                    >
                      <option value="Kore">Voice: Kore (Balanced)</option>
                      <option value="Puck">Voice: Puck (Energetic)</option>
                      <option value="Charon">Voice: Charon (Deep Authority)</option>
                      <option value="Fenrir">Voice: Fenrir (Warm Tone)</option>
                      <option value="Zephyr">Voice: Zephyr (Crisp)</option>
                    </select>

                    <button
                      onClick={() => generateAsset('VOICEOVER')}
                      disabled={Boolean(generatingAsset)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
                      title="Synthesize audio narration using gemini-3.8-flash-lite-tts"
                    >
                      {generatingAsset === 'VOICEOVER' ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Volume2 className="size-3 text-[#eaf79f]" />
                      )}
                      TTS Voiceover
                    </button>

                    <button
                      onClick={() => generateAsset('VIDEO')}
                      disabled={Boolean(generatingAsset)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                      title="Render video using gemini-omni-1.1-flash via Interactions API"
                    >
                      {generatingAsset === 'VIDEO' ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Film className="size-3" />
                      )}
                      Render Omni Video
                    </button>
                  </div>
                </div>

                {/* Sub-Tabs: Script, Storyboard, Practical Demos, Quiz */}
                <div className="flex flex-wrap gap-2 text-xs font-bold border-b border-white/10 pb-3">
                  <button
                    onClick={() => setActiveTab('script')}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      activeTab === 'script' ? 'bg-[#eaf79f] text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <BookOpen className="size-3.5" /> Full Lesson Script
                  </button>
                  <button
                    onClick={() => setActiveTab('storyboard')}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      activeTab === 'storyboard' ? 'bg-[#eaf79f] text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Film className="size-3.5" /> Scene Storyboard
                  </button>
                  <button
                    onClick={() => setActiveTab('practical')}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      activeTab === 'practical' ? 'bg-[#eaf79f] text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <ListChecks className="size-3.5" /> Demos & Exercises
                  </button>
                  <button
                    onClick={() => setActiveTab('quiz')}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      activeTab === 'quiz' ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <HelpCircle className="size-3.5" /> Assessment & Quiz
                  </button>
                  <button
                    onClick={() => setActiveTab('media')}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      activeTab === 'media' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Film className="size-3.5" /> Video & External Links
                  </button>
                </div>

                {/* Tab 1: Script */}
                {activeTab === 'script' && (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/50">
                      Word-for-Word Spoken Narration Script
                    </label>
                    <textarea
                      value={selected.script || ''}
                      onChange={(e) => setSelected({ ...selected, script: e.target.value })}
                      rows={12}
                      placeholder="Write or edit the lecture script..."
                      className="w-full rounded-2xl border border-white/10 bg-[#0a0c0b] p-4 text-sm leading-relaxed text-white outline-none focus:border-[#eaf79f] font-serif"
                    />
                  </div>
                )}

                {/* Tab 2: Storyboard */}
                {activeTab === 'storyboard' && (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/50">
                      Scene-by-Scene Storyboard & Camera Directives (JSON or formatted text)
                    </label>
                    <textarea
                      value={selected.storyboard || ''}
                      onChange={(e) => setSelected({ ...selected, storyboard: e.target.value })}
                      rows={10}
                      placeholder='[{"sceneNumber": 1, "visualDescription": "...", "narrationText": "...", "onScreenText": "..."}]'
                      className="w-full rounded-2xl border border-white/10 bg-[#0a0c0b] p-4 text-xs font-mono text-white/90 outline-none focus:border-[#eaf79f]"
                    />
                  </div>
                )}

                {/* Tab 3: Practical Demos & Exercises */}
                {activeTab === 'practical' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1">
                        Step-by-Step Practical Demonstration
                      </label>
                      <textarea
                        value={selected.practicalDemonstrations || ''}
                        onChange={(e) =>
                          setSelected({ ...selected, practicalDemonstrations: e.target.value })
                        }
                        rows={5}
                        className="w-full rounded-2xl border border-white/10 bg-[#0a0c0b] p-3 text-xs leading-relaxed text-white outline-none focus:border-[#eaf79f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                        Hands-on Student Exercise
                      </label>
                      <textarea
                        value={selected.exercises || ''}
                        onChange={(e) => setSelected({ ...selected, exercises: e.target.value })}
                        rows={4}
                        className="w-full rounded-2xl border border-white/10 bg-[#0a0c0b] p-3 text-xs leading-relaxed text-white outline-none focus:border-[#eaf79f]"
                      />
                    </div>
                  </div>
                )}

                {/* Tab 4: Quiz & Assessment */}
                {activeTab === 'quiz' && (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-400">
                      Multiple Choice Question Prompt
                    </label>
                    <input
                      value={selected.quiz?.prompt || ''}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          quiz: {
                            prompt: e.target.value,
                            answer: selected.quiz?.answer || '',
                            options: selected.quiz?.options || '',
                            explanation: selected.quiz?.explanation || '',
                          },
                        })
                      }
                      placeholder="e.g. What role does CSS play in web design?"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0c0b] p-3 text-xs text-white outline-none focus:border-purple-400"
                    />

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1">
                        Options (JSON array of strings)
                      </label>
                      <input
                        value={selected.quiz?.options || ''}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            quiz: {
                              prompt: selected.quiz?.prompt || '',
                              answer: selected.quiz?.answer || '',
                              options: e.target.value,
                              explanation: selected.quiz?.explanation || '',
                            },
                          })
                        }
                        placeholder='["Option A", "Option B", "Option C"]'
                        className="w-full rounded-xl border border-white/10 bg-[#0a0c0b] p-3 text-xs font-mono text-white outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                        Correct Answer Key
                      </label>
                      <input
                        value={selected.quiz?.answer || ''}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            quiz: {
                              prompt: selected.quiz?.prompt || '',
                              answer: e.target.value,
                              options: selected.quiz?.options || '',
                              explanation: selected.quiz?.explanation || '',
                            },
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0a0c0b] p-3 text-xs text-white outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1">
                        Explanation for Learner
                      </label>
                      <textarea
                        value={selected.quiz?.explanation || ''}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            quiz: {
                              prompt: selected.quiz?.prompt || '',
                              answer: selected.quiz?.answer || '',
                              options: selected.quiz?.options || '',
                              explanation: e.target.value,
                            },
                          })
                        }
                        rows={3}
                        className="w-full rounded-xl border border-white/10 bg-[#0a0c0b] p-3 text-xs text-white outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>
                )}

                {/* Tab 5: Media & Video */}
                {activeTab === 'media' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1">
                        YouTube or External Reference Link
                      </label>
                      <input
                        value={selected.youtubeUrl || ''}
                        onChange={(e) => setSelected({ ...selected, youtubeUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full rounded-xl border border-white/10 bg-[#0a0c0b] p-3 text-xs text-white outline-none focus:border-[#eaf79f]"
                      />
                    </div>

                    {selected.audioUrl && (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <Volume2 className="size-4 text-[#eaf79f]" /> Active TTS Audio Track
                        </span>
                        <audio controls src={selected.audioUrl} className="w-full" />
                      </div>
                    )}

                    {selected.videoUrl && (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <Film className="size-4 text-purple-400" /> Active Video Track
                        </span>
                        <video controls src={selected.videoUrl} className="w-full rounded-xl max-h-64 object-contain" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-white/40 text-sm">
                Select a lesson from the curriculum navigator to edit its content.
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
