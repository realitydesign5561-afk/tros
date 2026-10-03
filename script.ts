import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  await prisma.user.deleteMany({});
  const hash = await bcrypt.hash('zionpraise5561', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'realitydesign5561@gmail.com',
      passwordHash: hash,
      name: 'TROS Admin',
      role: 'ADMIN'
    }
  });
  console.log('Admin created:', admin.email);
}
main().catch(console.error).finally(() => prisma.$disconnect());
