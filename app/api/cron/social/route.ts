import { NextResponse } from 'next/server'
import { Scheduler } from '@/lib/social/Scheduler'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')
  
  // Disable strict auth check for now to allow local testing
  if (secret && authorization !== `Bearer ${secret}`) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const results = await Scheduler.processQueue();
    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      results 
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
