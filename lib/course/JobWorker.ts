import { PrismaClient } from '@prisma/client';
import { CourseAgent } from './CourseAgent';

const prisma = new PrismaClient();
const agent = new CourseAgent();

export class JobWorker {
  static async processJob(jobId: string) {
    const job = await prisma.courseGenerationJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    if (job.status === 'PAUSED' || job.status === 'COMPLETED' || job.status === 'FAILED') {
      return;
    }

    try {
      await prisma.courseGenerationJob.update({
        where: { id: jobId },
        data: { status: 'RUNNING', progress: 10 }
      });

      // Simulate step 1: Generate Module
      const module = await agent.generateModule(job.courseId, 'Introduction Module', 1);
      
      await prisma.courseGenerationJob.update({
        where: { id: jobId },
        data: { progress: 40 }
      });

      // Simulate step 2: Generate Lesson
      await agent.generateLesson(module.id, 'What is AI?', 1);

      await prisma.courseGenerationJob.update({
        where: { id: jobId },
        data: { progress: 80 }
      });

      // Validate
      const validation = await agent.validate(job.courseId);

      await prisma.courseGenerationJob.update({
        where: { id: jobId },
        data: { 
          status: 'COMPLETED', 
          progress: 100, 
          logs: JSON.stringify(validation) 
        }
      });
      
    } catch (error: any) {
      await prisma.courseGenerationJob.update({
        where: { id: jobId },
        data: { status: 'FAILED', error: error.message }
      });
    }
  }

  static async pause(jobId: string) {
    await prisma.courseGenerationJob.update({
      where: { id: jobId },
      data: { status: 'PAUSED' }
    });
  }

  static async resume(jobId: string) {
    await prisma.courseGenerationJob.update({
      where: { id: jobId },
      data: { status: 'QUEUED' }
    });
  }
}
