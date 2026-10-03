import { NextResponse } from 'next/server';
import { LeadAgent } from '@/lib/lead/LeadAgent';

const agent = new LeadAgent();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === 'discover') {
      const leads = await agent.discover(body.query, body.ownerId);
      return NextResponse.json({ leads });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
