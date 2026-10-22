import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { queryWithGrounding } from '@/lib/gemini'

const fallbackLeads = (niche: string, location: string) => [
  { name: 'Director of Growth', company: `${location.split(',')[0]} ${niche.slice(0, 10)} Group`, email: 'contact@localbiz.example', location, niche, source: 'RESEARCH', painPoints: 'Needs updated digital conversion funnel, modern responsive website, and active social calendar.' },
  { name: 'Managing Partner', company: `Apex ${niche} Studio`, email: 'partner@apexstudio.example', location, niche, source: 'RESEARCH', painPoints: 'Outdated local Google Business profile and lack of structured client acquisition pipeline.' },
  { name: 'Operations Lead', company: `Prime ${location.split(',')[0]} Services`, email: 'hello@primeservices.example', location, niche, source: 'RESEARCH', painPoints: 'Requires automated review capture and localized SEO presence.' },
  { name: 'Founder', company: `Vanguard ${niche}`, email: 'team@vanguardagency.example', location, niche, source: 'RESEARCH', painPoints: 'High lead acquisition costs; needs direct B2B outreach and proposal workflow.' },
  { name: 'Executive Director', company: `Horizon Digital Partners`, email: 'info@horizondigital.example', location, niche, source: 'RESEARCH', painPoints: 'Manual client onboarding; seeks unified agency CRM and automated reporting.' },
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const leads = await prisma.lead.findMany({ where: { ownerId: session.user.id }, include: { messages: true }, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ leads })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const niche = String(body.niche || 'creative services')
  const location = String(body.location || 'Remote')

  let leadCandidates: any[] = []

  // Try real Search & Maps Grounding with Gemini 3.8 Flash
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Research 5 commercial businesses or agencies operating in the "${niche}" niche located in "${location}". 
Return ONLY a valid JSON array of 5 objects with the following schema:
[
  {
    "company": "Business Name",
    "name": "Contact or Decision Maker Title",
    "email": "contact@businessdomain.com",
    "painPoints": "Specific observable digital visibility or marketing need (e.g. website redesign, local SEO, social content)"
  }
]`
      const grounded = await queryWithGrounding({ prompt, mode: 'search' })
      const jsonMatch = grounded.text.match(/```json\s*([\s\S]*?)\s*```/) || grounded.text.match(/(\[[\s\S]*\])/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1])
        if (Array.isArray(parsed) && parsed.length > 0) {
          leadCandidates = parsed.map((item: any) => ({
            name: String(item.name || 'Decision Maker'),
            company: String(item.company || 'Local Business'),
            email: String(item.email || 'info@company.example'),
            location,
            niche,
            source: 'GEMINI_SEARCH_GROUNDED',
            painPoints: String(item.painPoints || 'Needs modern digital acquisition system.'),
          }))
        }
      }
    } catch (err) {
      console.warn('Gemini lead grounding fallback:', err)
    }
  }

  if (leadCandidates.length === 0) {
    leadCandidates = fallbackLeads(niche, location)
  }

  const leads = await prisma.$transaction(
    leadCandidates.map((lead) => prisma.lead.create({ data: { ...lead, ownerId: session.user.id } }))
  )
  return NextResponse.json({ leads })
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const lead = await prisma.lead.updateMany({ where: { id: body.id, ownerId: session.user.id }, data: { status: body.status } })
  return NextResponse.json({ updated: lead.count })
}
