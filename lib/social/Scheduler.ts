import { PrismaClient } from '@prisma/client';
import { TwitterAdapter } from './adapters/TwitterAdapter';

const prisma = new PrismaClient();

const adapters: Record<string, any> = {
  twitter: new TwitterAdapter(),
  // add other adapters here
};

export class Scheduler {
  /**
   * Process all SCHEDULED posts that are due
   */
  static async processQueue() {
    const now = new Date();
    
    // Find all scheduled posts due for publication
    const duePosts = await prisma.socialPost.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          lte: now,
        },
      },
      include: {
        owner: {
          include: {
            socialSessions: true,
          }
        }
      }
    });

    const results = [];

    for (const post of duePosts) {
      try {
        const adapter = adapters[post.platform];
        if (!adapter) throw new Error(`No adapter for platform ${post.platform}`);

        const session = post.owner.socialSessions.find(s => s.platform === post.platform);
        if (!session || !session.accessToken) {
          throw new Error(`No active session for platform ${post.platform}`);
        }

        // Check if duplicate (already has externalPostId)
        if (post.externalPostId) {
           throw new Error('Post already has an external ID. Duplicate prevented.');
        }

        const result = await adapter.publishPost(session.accessToken, {
          content: post.caption,
          mediaUrls: post.imageUrl ? [post.imageUrl] : undefined,
        });

        // Update post status
        await prisma.socialPost.update({
          where: { id: post.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            externalPostId: result.externalPostId,
          }
        });

        results.push({ id: post.id, status: 'success' });
      } catch (error: any) {
        // Record failure
        await prisma.socialPost.update({
          where: { id: post.id },
          data: {
            status: 'FAILED',
            errorMessages: error.message,
          }
        });
        results.push({ id: post.id, status: 'failed', error: error.message });
      }
    }

    return results;
  }
}
