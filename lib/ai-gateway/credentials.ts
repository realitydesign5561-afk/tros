import { prisma } from '@/lib/prisma'
import { decryptCredential } from './crypto'

function normalizeProviderKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
}

export async function resolveServerCredential(providerNames: string[], ownerId?: string) {
  const providerKeys = [...new Set(providerNames.flatMap((name) => [name, normalizeProviderKey(name)]))]
  const credentials = await prisma.credential.findMany({
    where: { providerKey: { in: providerKeys }, status: 'ACTIVE', OR: ownerId ? [{ ownerId }, { ownerId: null }] : [{ ownerId: null }] },
    orderBy: [{ ownerId: 'asc' }, { updatedAt: 'desc' }],
  })
  for (const credential of credentials) {
    try {
      const value = decryptCredential(credential.ciphertext, credential.keyVersion)
      await prisma.credential.update({ where: { id: credential.id }, data: { lastUsedAt: new Date() } })
      return { value, credentialId: credential.id, providerKey: credential.providerKey }
    } catch (error) {
      console.error(`[credentials] Could not decrypt credential ${credential.id} (${credential.keyVersion}).`)
      throw new Error('Stored credential could not be decrypted with the configured key ring.')
    }
  }
  return null
}
