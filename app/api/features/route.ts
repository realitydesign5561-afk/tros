import { NextResponse } from 'next/server';
import { SandboxService } from '@/lib/feature-factory/SandboxService';

const sandbox = new SandboxService();

export async function POST(req: Request) {
  try {
    const { action, featureId } = await req.json();
    if (!featureId) return NextResponse.json({ error: 'Missing featureId' }, { status: 400 });

    if (action === 'build') {
      const res = await sandbox.buildFeature(featureId);
      return NextResponse.json({ result: res });
    }
    if (action === 'test') {
      const res = await sandbox.runTests(featureId);
      return NextResponse.json({ result: res });
    }
    if (action === 'deploy') {
      const res = await sandbox.deployToMaster(featureId);
      return NextResponse.json({ result: res });
    }
    if (action === 'rollback') {
      const res = await sandbox.rollback(featureId, 'previous');
      return NextResponse.json({ result: res });
    }
    
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
