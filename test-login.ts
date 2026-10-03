import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'realitydesign5561@gmail.com' } });
  console.log('User found:', user);
  if (user) {
    const match = await bcrypt.compare('zionpraise5561', user.passwordHash);
    console.log('Password match:', match);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
