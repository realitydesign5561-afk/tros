import crypto from 'crypto'

const rawKey = process.env.SOCIAL_ENCRYPTION_KEY || '0000000000000000000000000000000000000000000000000000000000000000'
const ENCRYPTION_KEY = Buffer.from(rawKey.padEnd(64, '0').slice(0, 64), 'hex')

export function encryptSession(data: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
  return `${iv.toString('hex')}:${cipher.update(data, 'utf8', 'hex')}${cipher.final('hex')}`
}

export function decryptSession(value: string): string {
  const [ivHex, encryptedHex] = value.split(':')
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(ivHex, 'hex'))
  return `${decipher.update(encryptedHex, 'hex', 'utf8')}${decipher.final('utf8')}`
}

export const sessionEncryptionConfigured = Boolean(process.env.SOCIAL_ENCRYPTION_KEY)
export const sessionEncryptionWarning = sessionEncryptionConfigured ? '' : 'Set SOCIAL_ENCRYPTION_KEY before production use.'
