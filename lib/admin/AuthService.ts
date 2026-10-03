import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Secure Bootstrap: Checks if an admin exists, if not, creates one via env vars.
   */
  async bootstrapAdmin() {
    const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminExists) {
      const email = process.env.ADMIN_EMAIL;
      const password = process.env.ADMIN_PASS;
      if (email && password) {
        const hash = await bcrypt.hash(password, 10);
        await prisma.user.create({
          data: {
            email,
            passwordHash: hash,
            role: 'ADMIN',
            status: 'ACTIVE'
          }
        });
        console.log('Admin bootstrapped securely.');
      }
    }
  }

  /**
   * Signup for standard users, always PENDING_APPROVAL.
   */
  async signup(email: string, passwordHash: string) {
    return prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'USER',
        status: 'PENDING_APPROVAL'
      }
    });
  }

  /**
   * Server-side authorization check.
   */
  async checkPermission(userId: string, featureName: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { featurePermissions: true } });
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    
    return user.featurePermissions.some(fp => fp.featureName === featureName);
  }
}

export const authService = new AuthService();
