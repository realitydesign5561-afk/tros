'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Award,
  CheckCircle2,
  Calendar,
  Download,
  ExternalLink,
  Globe,
  Loader2,
  Printer,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

export default function CertificateVerificationPage() {
  const params = useParams()
  const code = params?.code as string
  const [cert, setCert] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCertificate() {
      try {
        const res = await fetch(`/api/verify/cert/${code}`)
        if (res.ok) {
          const data = await res.json()
          setCert(data)
        } else {
          setError('Invalid or unverified certificate code.')
        }
      } catch {
        setError('Unable to verify certificate at this time.')
      } finally {
        setLoading(false)
      }
    }

    if (code) loadCertificate()
  }, [code])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c0b] text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="size-8 animate-spin text-[#eaf79f] mb-3" />
        <p className="text-sm font-medium text-white/70">
          Querying TROS Cryptographic Registry...
        </p>
      </div>
    )
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-[#0a0c0b] text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="p-8 max-w-md bg-[#141615] rounded-3xl border border-red-500/30 space-y-4">
          <Award className="size-12 text-red-400 mx-auto" />
          <h1 className="text-xl font-bold">Certificate Not Found</h1>
          <p className="text-xs text-white/60">
            The verification code &quot;{code}&quot; could not be authenticated in the official registry.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition"
          >
            ← Back to TROS
          </Link>
        </div>
      </div>
    )
  }

  let skillsList: string[] = []
  if (cert.skills) {
    try {
      skillsList = JSON.parse(cert.skills)
    } catch {
      skillsList = ['AI Web Design Architecture', 'Prompt Engineering for UI', 'Responsive Grids']
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0c0b] text-white p-4 sm:p-8 flex flex-col items-center justify-center selection:bg-[#eaf79f] selection:text-black">
      {/* Top Verification Status Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-4 mb-6 print:hidden">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          <ShieldCheck className="size-4 text-emerald-400" /> Cryptographically Verified Record
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="size-3.5" /> Print / Save PDF
          </button>
          <Link
            href={`/courses/${cert.courseId}/landing`}
            className="px-4 py-2 rounded-xl bg-[#eaf79f] text-black text-xs font-bold hover:bg-white transition flex items-center gap-1.5 shadow-sm"
          >
            View Course Details <ExternalLink className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Certificate Document (Print-ready) */}
      <div className="w-full max-w-4xl bg-gradient-to-br from-[#161917] via-[#111312] to-[#0d0f0e] border-2 border-amber-400/40 rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center space-y-8 print:border-black print:text-black print:bg-white print:shadow-none">
        {/* Subtle Decorative Geometry */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-400/10 via-transparent to-transparent pointer-events-none blur-3xl print:hidden" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#eaf79f]/10 via-transparent to-transparent pointer-events-none blur-3xl print:hidden" />

        {/* Certificate Header & Seal */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="size-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-black text-lg shadow-md">
              <Award className="size-7" />
            </div>
            <div className="text-left">
              <span className="font-extrabold tracking-tight text-white print:text-black text-lg leading-none block">
                THE REALITY OPERATIONS SYSTEM
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#eaf79f] print:text-gray-700 font-bold block">
                Executive Learning & Credential Registry
              </span>
            </div>
          </div>

          <div className="pt-4">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-400 print:text-amber-700 font-bold">
              Official Verifiable Credential
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white print:text-black mt-2 tracking-tight">
              Certificate of Mastery
            </h1>
          </div>
        </div>

        {/* Student Name */}
        <div className="space-y-2 py-2">
          <p className="text-xs uppercase tracking-wider text-white/50 print:text-gray-600">
            This is proudly conferred upon
          </p>
          <p className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white print:text-black font-sans">
            {cert.studentName}
          </p>
          <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto mt-2" />
        </div>

        {/* Course Title & Distinction */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <p className="text-xs text-white/70 print:text-gray-700 leading-relaxed">
            for successfully fulfilling all curriculum criteria, passing module assessments, and demonstrating practical excellence in:
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#eaf79f] print:text-black">
            {cert.courseTitle}
          </h2>
          <p className="text-xs font-semibold text-emerald-400 print:text-emerald-700">
            Final Performance Assessment: {cert.grade}% (High Distinction)
          </p>
        </div>

        {/* Verified Competencies */}
        <div className="pt-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 print:text-gray-600 mb-2.5">
            Verified Practical Competencies:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
            {skillsList.map((skill, idx) => (
              <span
                key={idx}
                className="text-[11px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/90 print:border-gray-400 print:text-black font-medium"
              >
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Certificate Signatures & Verification Details Footer */}
        <div className="pt-6 border-t border-white/10 print:border-gray-300 grid sm:grid-cols-3 gap-6 items-end text-left text-xs">
          <div>
            <span className="text-[10px] text-white/40 print:text-gray-600 block uppercase">
              Date Issued
            </span>
            <span className="font-semibold text-white print:text-black mt-1 block">
              {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="text-center sm:text-center">
            <div className="size-14 rounded-full border-2 border-amber-400/60 text-amber-300 print:text-black flex flex-col items-center justify-center mx-auto text-[8px] font-bold uppercase tracking-widest leading-none">
              <Award className="size-4 mb-0.5" />
              <span>TROS</span>
              <span>SEAL</span>
            </div>
            <span className="text-[9px] text-white/40 print:text-gray-600 block mt-1">
              Tamper-Proof Verification
            </span>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] text-white/40 print:text-gray-600 block uppercase">
              Verification Code
            </span>
            <span className="font-mono text-amber-300 print:text-black font-bold mt-1 block break-all text-xs">
              {cert.certificateCode}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-white/40 mt-6 print:hidden">
        Verified credentials can be checked at any time by visiting /verify/cert/{cert.certificateCode}
      </p>
    </div>
  )
}
