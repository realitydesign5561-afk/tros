import { loadEnvConfig } from '@next/env'
import { PrismaClient } from '../node_modules/.prisma/client'
import { credentialFingerprint, decryptCredential, encryptCredential } from '../lib/ai-gateway/crypto'

loadEnvConfig(process.cwd())
const prisma = new PrismaClient()
const dryRun = process.argv.includes('--dry-run')

function providerKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'legacy-provider'
}

async function main() {
  const rows = await prisma.apiKey.findMany({ orderBy: { createdAt: 'asc' } })
  let migrated = 0
  let duplicates = 0
  let ambiguous = 0

  for (const row of rows) {
    const provider = await prisma.aiProvider.findFirst({ where: { OR: [{ key: row.provider }, { name: row.provider }] }, select: { key: true } })
    const key = provider?.key || providerKey(row.provider)
    const fingerprint = credentialFingerprint(row.value)
    const active = await prisma.credential.findMany({ where: { ownerId: null, providerKey: key, status: 'ACTIVE' }, select: { id: true, fingerprint: true } })
    if (active.some((credential) => credential.fingerprint === fingerprint)) {
      if (!dryRun) await prisma.apiKey.delete({ where: { id: row.id } })
      duplicates += 1
      continue
    }
    if (active.length) {
      ambiguous += 1
      continue
    }

    if (dryRun) {
      migrated += 1
      continue
    }

    const encrypted = encryptCredential(row.value)
    const saved = await prisma.credential.create({ data: { ownerId: null, providerKey: key, label: row.label, ciphertext: encrypted.ciphertext, keyVersion: encrypted.keyVersion, fingerprint } })
    if (decryptCredential(saved.ciphertext, saved.keyVersion) !== row.value) {
      await prisma.credential.delete({ where: { id: saved.id } })
      throw new Error(`Credential verification failed for legacy row ${row.id}; plaintext row was preserved.`)
    }
    await prisma.apiKey.delete({ where: { id: row.id } })
    migrated += 1
  }

  const remainingPlaintextRows = await prisma.apiKey.count()
  console.log(JSON.stringify({ dryRun, examined: rows.length, migrated, duplicatesRemoved: duplicates, ambiguousPreserved: ambiguous, remainingPlaintextRows }))
  if (ambiguous) process.exitCode = 2
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Legacy credential migration failed.')
  process.exitCode = 1
}).finally(() => prisma.$disconnect())
