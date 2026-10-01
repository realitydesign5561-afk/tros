import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD
  if (!email || !password) return

  const passwordHash = await hash(password, 12)
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: 'TROS Admin', role: 'ADMIN' },
  })
}

main().finally(() => prisma.$disconnect())
