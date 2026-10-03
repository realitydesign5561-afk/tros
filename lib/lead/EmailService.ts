import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EmailService {
  /**
   * Connects via OAuth or SMTP
   */
  async verifyConnection(connectionId: string) {
    const conn = await prisma.emailConnection.findUnique({ where: { id: connectionId } });
    if (!conn) throw new Error('Connection not found');
    
    // Stub verifying SMTP/OAuth
    return true;
  }

  /**
   * lead.sendEmail
   */
  async sendEmail(messageId: string, connectionId: string) {
    const message = await prisma.leadMessage.findUnique({ 
      where: { id: messageId },
      include: { lead: true }
    });

    if (!message) return;

    // Suppression list check
    const isSuppressed = await prisma.suppressionList.findFirst({
      where: { email: message.lead.email }
    });

    if (isSuppressed || message.lead.unsubscribed) {
      await prisma.leadMessage.update({
        where: { id: messageId },
        data: { status: 'FAILED_SUPPRESSED' }
      });
      return false;
    }

    // Mock send logic
    await prisma.leadMessage.update({
      where: { id: messageId },
      data: { status: 'SENT', sentAt: new Date(), providerId: connectionId }
    });

    return true;
  }
}
