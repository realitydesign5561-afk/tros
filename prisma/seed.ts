import { prisma } from '../lib/prisma'
import { hash } from 'bcryptjs'

async function main() {
  const passwordHash = await hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@reality.com' },
    update: { passwordHash, name: 'TROS Admin', role: 'ADMIN' },
    create: { email: 'admin@reality.com', passwordHash, name: 'TROS Admin', role: 'ADMIN' },
  })
}

main().finally(() => prisma.$disconnect())
