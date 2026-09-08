import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@reality.com' },
    update: { passwordHash, name: 'TROS Admin', role: 'ADMIN' },
    create: { email: 'admin@reality.com', passwordHash, name: 'TROS Admin', role: 'ADMIN' },
  })
}

main().finally(() => prisma.$disconnect())
