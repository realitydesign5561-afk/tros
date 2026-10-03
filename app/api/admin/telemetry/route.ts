import { NextResponse } from 'next/server';
import { opsService } from '@/lib/core/OperationsService';

export async function GET() {
  try {
    const telemetry = await opsService.getTelemetry();
    return NextResponse.json({ telemetry });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
