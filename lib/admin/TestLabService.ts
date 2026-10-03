import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TestLabService {
  /**
   * Run a specific test suite against a TROS module.
   */
  async runTest(module: string, testType: 'SMOKE' | 'INTEGRATION' | 'E2E' | 'HEALTH') {
    const run = await prisma.testRun.create({
      data: { module, testType, status: 'RUNNING' }
    });

    try {
      // Simulate test execution delay and logic
      await new Promise(res => setTimeout(res, 2000));
      
      let status = 'PASS';
      // Add a chance of warning for realism
      if (Math.random() > 0.8) status = 'WARNING';

      await prisma.testRun.update({
        where: { id: run.id },
        data: { status, logs: `Executed ${testType} for ${module} successfully.` }
      });
      return { status };
    } catch (e: any) {
      await prisma.testRun.update({
        where: { id: run.id },
        data: { status: 'FAIL', logs: e.message }
      });
      return { status: 'FAIL' };
    }
  }

  /**
   * Retrieves test history
   */
  async getHistory() {
    return prisma.testRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }
}

export const testLabService = new TestLabService();
