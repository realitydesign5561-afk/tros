import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { JobWorker } from '@/lib/course/JobWorker';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

/**
 * Cron endpoint that processes all queued CourseGenerationJob entries.
 * It will be invoked by a scheduled task (e.g., every minute).
 */
export async function GET() {
  const queuedJobs = await prisma.courseGenerationJob.findMany({
    where: { status: { in: ['QUEUED', 'RUNNING'] } },
  });

  for (const job of queuedJobs) {
    // Fire-and-forget processing; errors are handled inside JobWorker
    JobWorker.processJob(job.id).catch((e) => console.error('Job processing error', e));
  }

  return NextResponse.json({ processed: queuedJobs.length });
}
