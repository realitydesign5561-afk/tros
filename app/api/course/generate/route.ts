import { NextResponse } from 'next/server';
import { CourseAgent } from '@/lib/course/CourseAgent';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const agent = new CourseAgent();

export async function POST(request: Request) {
  const { prompt, userId } = await request.json();
  if (!prompt || !userId) {
    return NextResponse.json({ error: 'prompt and userId required' }, { status: 400 });
  }

  // Create Course and Job via agent.plan
  const { course, job } = await agent.plan(prompt, userId);

  return NextResponse.json({ courseId: course.id, jobId: job.id });
}
