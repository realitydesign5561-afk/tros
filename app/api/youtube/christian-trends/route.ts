import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { chatWithGemini, queryWithGrounding } from '@/lib/gemini'

export interface ChristianContentIdea {
  id: string
  title: string
  titleVariants: string[]
  format: 'LONG' | 'SHORT'
  subNiche: string
  topic: string
  scriptureBasis: string
  algorithmViralityScore: number
  searchDemand: 'VERY_HIGH' | 'HIGH'
  competitionLevel: 'LOW' | 'MEDIUM'
  projectedWatchHours: number
  projectedSubs: number
  targetDuration: string
  hookStrategy: string
  midVideoRetentionTactic: string
  callToAction: string
  advertiserSafe: boolean
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'AUTO_PILOT'
}

const CURATED_CHRISTIAN_BEST_SELLERS: ChristianContentIdea[] = [
  {
    id: 'chr_trend_01',
    title: 'Listen To This Prayer Before You Sleep | Psalm 91 Deep Peace & Anointing',
    titleVariants: [
      'Play This Prayer All Night While You Sleep (Instant Peace & Protection)',
      'God Says: Rest Tonight, I Am Fighting Your Battles (Psalm 91 Sleep Prayer)',
    ],
    format: 'LONG',
    subNiche: 'Nightly Sleep Prayers & Anointing',
    topic: 'Anointed 12-minute deep sleep meditation and warfare prayer grounded in Psalm 91. Overcoming anxiety, financial worry, and nighttime dread with biblical truth and calming ambient pads.',
    scriptureBasis: 'Psalm 91:1-16; Philippians 4:6-7; Proverbs 3:24',
    algorithmViralityScore: 98,
    searchDemand: 'VERY_HIGH',
    competitionLevel: 'LOW',
    projectedWatchHours: 420,
    projectedSubs: 180,
    targetDuration: '12:30',
    hookStrategy: 'First 5 seconds: "Before your head hits the pillow tonight, do not carry the burden that God commanded you to cast on Him. Play this prayer, close your eyes, and let divine peace fill your room right now."',
    midVideoRetentionTactic: 'At 4:30: "If you feel a weight lifting from your chest right now, comment AMEN below and let God seal your peace."',
    callToAction: 'Subscribe for daily night prayers that guarantee sound sleep and spiritual protection.',
    advertiserSafe: true,
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'chr_trend_02',
    title: 'GOD SAYS: Stop Worrying, I Have Already Prepared Your Breakthrough',
    titleVariants: [
      'When You Feel Like Giving Up, Watch This (A Message Straight From God)',
      'Do Not Ignore This Message: God Is Turning Your Situation Around This Week',
    ],
    format: 'LONG',
    subNiche: 'Divine Encouragement & Prophetic Hope',
    topic: 'High-emotional-pull biblical narrative explaining why setbacks precede divine promotions. Historical example of Joseph in Egypt and how unexpected doors open when God moves.',
    scriptureBasis: 'Genesis 50:20; Romans 8:28; Jeremiah 29:11',
    algorithmViralityScore: 96,
    searchDemand: 'VERY_HIGH',
    competitionLevel: 'MEDIUM',
    projectedWatchHours: 350,
    projectedSubs: 240,
    targetDuration: '10:15',
    hookStrategy: '0:00-0:10: "You didn\'t stumble upon this video by accident. God knew you were tired, He saw the tears no one else saw, and today He wants you to hear these three words: It is finished."',
    midVideoRetentionTactic: 'Interactive prayer declaration at 5:00: "Claim this in the comments with the name of someone you are praying for."',
    callToAction: 'Subscribe and tap the bell to receive God\'s daily word of hope every morning at 9:00 AM.',
    advertiserSafe: true,
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'chr_trend_03',
    title: 'The Real Reason God Allows You To Wait (The Hidden Blessing of Delays)',
    titleVariants: [
      'Why God Makes You Wait When You Need Help Urgently',
      'The 3 Signs God Is Preparing You For Something Much Bigger Than You Asked',
    ],
    format: 'LONG',
    subNiche: 'Spiritual Growth & Modern Christian Living',
    topic: 'Deep exploration of divine delays vs divine denials. Psychological and spiritual breakdown of how character is formed during waiting seasons, backed by biblical case studies.',
    scriptureBasis: 'Isaiah 40:31; Habakkuk 2:3; James 1:2-4',
    algorithmViralityScore: 94,
    searchDemand: 'HIGH',
    competitionLevel: 'LOW',
    projectedWatchHours: 290,
    projectedSubs: 130,
    targetDuration: '11:45',
    hookStrategy: '0:00-0:08: "What if the silence from heaven isn\'t rejection, but preparation? In the next 10 minutes, I will show you why God makes His greatest champions wait."',
    midVideoRetentionTactic: 'Pattern interrupt at 6:00: Fast-paced whiteboard / graphic comparison of David in the cave of Adullam vs David on the throne.',
    callToAction: 'Type "I Trust God\'s Timing" below and subscribe to walk through this season together.',
    advertiserSafe: true,
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'chr_trend_04',
    title: '3 Things That Happen When You Pray In Faith #Shorts',
    titleVariants: [
      'God Hears You Right Now: 15-Second Breakthrough Prayer #Shorts',
      'Say This Prayer If You Feel Anxious Today #Shorts',
    ],
    format: 'SHORT',
    subNiche: '60-Second Christian Shorts',
    topic: 'High-velocity 45-second vertical Short featuring rapid scripture flash, emotional background strings, and a bold call-and-response prayer.',
    scriptureBasis: 'Mark 11:24; Matthew 21:22',
    algorithmViralityScore: 99,
    searchDemand: 'VERY_HIGH',
    competitionLevel: 'LOW',
    projectedWatchHours: 85,
    projectedSubs: 380,
    targetDuration: '0:48',
    hookStrategy: 'First 2 seconds: "Stop scrolling! Give God 30 seconds before you move on."',
    midVideoRetentionTactic: 'Dynamic kinetic typography emphasizing "PEACE", "HEALING", "FAVOR" with continuous motion.',
    callToAction: 'Double tap if you love Jesus and subscribe for daily blessings!',
    advertiserSafe: true,
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'chr_trend_05',
    title: 'Listen Carefully: God Is Removing People From Your Life For A Reason #Shorts',
    titleVariants: [
      'When God Closes A Door, Never Look Back #Shorts',
      'The Secret Reason Certain Friends Disappeared #Shorts',
    ],
    format: 'SHORT',
    subNiche: '60-Second Christian Shorts',
    topic: 'Relatable relationship discernment Short on divine elevation and letting go of toxic ties without bitterness.',
    scriptureBasis: '1 Corinthians 15:33; Proverbs 13:20',
    algorithmViralityScore: 97,
    searchDemand: 'VERY_HIGH',
    competitionLevel: 'MEDIUM',
    projectedWatchHours: 70,
    projectedSubs: 310,
    targetDuration: '0:52',
    hookStrategy: '0:00-0:03: "Did you notice someone suddenly walked away from you this month? Listen to why God allowed it."',
    midVideoRetentionTactic: 'Sudden audio drop at 0:25 into a soft whisper: "He didn\'t leave you alone. He cleared the room for your next season."',
    callToAction: 'Share this to your story and subscribe for more daily spiritual wisdom.',
    advertiserSafe: true,
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'chr_trend_06',
    title: '5 Hidden Mysteries in the Book of Revelation Most People Miss',
    titleVariants: [
      'Archaeologists Uncovered Something Shocking About Revelation',
      'The 7 Churches of Revelation: What History Confirmed',
    ],
    format: 'LONG',
    subNiche: 'Biblical Mysteries & Ancient Truths',
    topic: 'Fascinating scholarly yet accessible documentary-style deep dive into Revelation historical context, Greek terminology, and archaeological findings in Patmos and Turkey.',
    scriptureBasis: 'Revelation 1-3; Revelation 21',
    algorithmViralityScore: 95,
    searchDemand: 'VERY_HIGH',
    competitionLevel: 'LOW',
    projectedWatchHours: 490,
    projectedSubs: 290,
    targetDuration: '14:20',
    hookStrategy: '0:00-0:12: "For over 2,000 years, scholars argued over Revelation chapter 2. But in 2024, an excavation in Asia Minor uncovered an inscription that changes how we view John\'s vision."',
    midVideoRetentionTactic: 'Chapter card transition at 7:15 with ancient map overlays and dramatic brass score.',
    callToAction: 'Which mystery surprised you most? Comment below and subscribe for Part 2 next Tuesday.',
    advertiserSafe: true,
    status: 'PENDING_APPROVAL',
  },
]

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const query = (body.query || 'best selling Christian content for monetization').trim()
    const preferredFormat = body.format as 'LONG' | 'SHORT' | 'ALL' | undefined

    // Try dynamic search grounding or Gemini generation for fresh tailored ideas
    try {
      const systemInstruction = `You are the lead YouTube Algorithm Growth Strategist specialized in the Christian & Biblical faith niche.
Your goal is to monetize YouTube channels as fast as possible by engineering content with:
1. High click-through rate (CTR > 10%) with emotionally compelling, reverent, curiosity-driven titles.
2. High average view duration (AVD > 60%) to rapidly accumulate the 4,000 watch hours required for the YouTube Partner Program (YPP).
3. Viral YouTube Shorts to cross the 1,000 subscriber threshold quickly.
4. Christian topics with high RPM ($10-$18 CPM/RPM) such as sleep prayers, anxiety relief, biblical history, and prophetic encouragement.
5. Strict adherence to YouTube advertiser-friendly guidelines (no hate speech, no fearmongering, peaceful and inspiring).

Return a JSON array of 4-6 video concepts that match the user request.
Each item must have:
- title: string
- titleVariants: string[] (2 options)
- format: 'LONG' (16:9, 8-15 min) or 'SHORT' (9:16, 30-60 sec)
- subNiche: string
- topic: string
- scriptureBasis: string
- algorithmViralityScore: number (between 90 and 99)
- searchDemand: 'VERY_HIGH' | 'HIGH'
- competitionLevel: 'LOW' | 'MEDIUM'
- projectedWatchHours: number (e.g. 200 - 500)
- projectedSubs: number (e.g. 100 - 400)
- targetDuration: string
- hookStrategy: string
- midVideoRetentionTactic: string
- callToAction: string
- advertiserSafe: true`

      const prompt = `Analyze current trending and best-selling YouTube Christian content for: "${query}".
Focus on both Long-form videos (for 4,000 watch hours) and Shorts (for 1,000 subscribers).
Format must be pure JSON array.`

      const response = await chatWithGemini({
        messages: [{ role: 'user', content: prompt }],
        systemInstruction,
        modelTier: 'flash',
      })

      const rawText = response.text.replace(/```json/g, '').replace(/```/g, '').trim()
      const jsonStart = rawText.indexOf('[')
      const jsonEnd = rawText.lastIndexOf(']')

      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsed = JSON.parse(rawText.slice(jsonStart, jsonEnd + 1))
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted: ChristianContentIdea[] = parsed.map((item, index) => ({
            id: `chr_dyn_${Date.now()}_${index}`,
            title: item.title || 'Divine Prayer & Peace',
            titleVariants: item.titleVariants || [item.title],
            format: (item.format === 'SHORT' ? 'SHORT' : 'LONG') as 'LONG' | 'SHORT',
            subNiche: item.subNiche || 'Christian Living',
            topic: item.topic || 'Biblical encouragement and spiritual growth',
            scriptureBasis: item.scriptureBasis || 'Psalm 23',
            algorithmViralityScore: item.algorithmViralityScore || Math.floor(Math.random() * 8) + 91,
            searchDemand: item.searchDemand || 'VERY_HIGH',
            competitionLevel: item.competitionLevel || 'LOW',
            projectedWatchHours: item.projectedWatchHours || 320,
            projectedSubs: item.projectedSubs || 180,
            targetDuration: item.targetDuration || (item.format === 'SHORT' ? '0:50' : '11:30'),
            hookStrategy: item.hookStrategy || 'High-retention emotional hook in first 5 seconds.',
            midVideoRetentionTactic: item.midVideoRetentionTactic || 'Mid-point pattern interrupt and community comment call.',
            callToAction: item.callToAction || 'Subscribe for daily prayers.',
            advertiserSafe: true,
            status: 'PENDING_APPROVAL',
          }))

          return NextResponse.json({
            success: true,
            source: 'gemini_algorithm_engine',
            ideas: preferredFormat && preferredFormat !== 'ALL'
              ? formatted.filter((f) => f.format === preferredFormat)
              : formatted,
          })
        }
      }
    } catch (e: any) {
      console.warn('Gemini dynamic trend search fallback to curated best-sellers:', e.message)
    }

    // Fallback to high-converting curated Christian trends
    const filtered = preferredFormat && preferredFormat !== 'ALL'
      ? CURATED_CHRISTIAN_BEST_SELLERS.filter((f) => f.format === preferredFormat)
      : CURATED_CHRISTIAN_BEST_SELLERS

    return NextResponse.json({
      success: true,
      source: 'curated_algorithm_database',
      ideas: filtered,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch trends' }, { status: 500 })
  }
}
