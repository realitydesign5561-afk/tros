import crypto from 'node:crypto'

function configuredEncryptionKey() {
  const rawKey = process.env.SOCIAL_ENCRYPTION_KEY
  if (!rawKey) throw new Error('SOCIAL_ENCRYPTION_KEY is required before saving social session credentials.')
  const key = /^[a-f0-9]{64}$/i.test(rawKey) ? Buffer.from(rawKey, 'hex') : Buffer.from(rawKey, 'base64')
  if (key.length !== 32) throw new Error('SOCIAL_ENCRYPTION_KEY must be a 32-byte base64 value or 64-character hex value.')
  return key
}

function legacyEncryptionKey() {
  const rawKey = process.env.SOCIAL_ENCRYPTION_KEY
  if (!rawKey) return Buffer.alloc(32)
  return Buffer.from(rawKey.padEnd(64, '0').slice(0, 64), 'hex')
}

export function encryptSession(data: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', configuredEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()])
  return `v2:${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptSession(value: string): string {
  const [version, ivHex, tagHex, encryptedHex] = value.split(':')
  if (version === 'v2' && ivHex && tagHex && encryptedHex) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', configuredEncryptionKey(), Buffer.from(ivHex, 'hex'))
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
    return Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]).toString('utf8')
  }

  const [legacyIv, legacyCiphertext] = value.split(':')
  if (!legacyIv || !legacyCiphertext) throw new Error('Invalid encrypted social session.')
  const decipher = crypto.createDecipheriv('aes-256-cbc', legacyEncryptionKey(), Buffer.from(legacyIv, 'hex'))
  return `${decipher.update(legacyCiphertext, 'hex', 'utf8')}${decipher.final('utf8')}`
}

export const sessionEncryptionConfigured = Boolean(process.env.SOCIAL_ENCRYPTION_KEY)
export const sessionEncryptionWarning = sessionEncryptionConfigured ? '' : 'Set SOCIAL_ENCRYPTION_KEY before saving social sessions. Existing legacy sessions can still be read but must be re-saved to use authenticated encryption.'
