import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/ai-gateway/admin'
import { currentCredentialKeyVersion, decryptCredential, encryptCredential } from '@/lib/ai-gateway/crypto'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    await requireAdmin()
    const targetVersion = currentCredentialKeyVersion()
    const credentials = await prisma.credential.findMany({ where: { keyVersion: { not: targetVersion } }, take: 100, orderBy: { createdAt: 'asc' } })
    let rotated = 0
    let failed = 0

    for (const credential of credentials) {
      try {
        const plaintext = decryptCredential(credential.ciphertext, credential.keyVersion)
        const replacement = encryptCredential(plaintext)
        if (replacement.keyVersion !== targetVersion || decryptCredential(replacement.ciphertext, replacement.keyVersion) !== plaintext) throw new Error('Credential rotation verification failed.')
        const result = await prisma.credential.updateMany({ where: { id: credential.id, keyVersion: credential.keyVersion, ciphertext: credential.ciphertext }, data: { ciphertext: replacement.ciphertext, keyVersion: replacement.keyVersion } })
        if (result.count) rotated += 1
      } catch {
        failed += 1
      }
    }

    const remaining = await prisma.credential.count({ where: { keyVersion: { not: targetVersion } } })
    return NextResponse.json({ targetKeyVersion: targetVersion, rotated, failed, remaining, complete: remaining === 0 })
  } catch (error) {
    const isAuth = error instanceof Error && error.message === 'ADMIN_REQUIRED'
    return NextResponse.json({ error: isAuth ? 'Unauthorized' : error instanceof Error ? error.message : 'Credential rotation failed.' }, { status: isAuth ? 401 : 500 })
  }
}
