import crypto from 'node:crypto'

const algorithm = 'aes-256-gcm'
const keyVersion = 'v1'

function encryptionKey() {
  const rawKey = process.env.AI_CREDENTIAL_ENCRYPTION_KEY
  if (!rawKey) throw new Error('AI_CREDENTIAL_ENCRYPTION_KEY is required for provider credentials.')
  const key = Buffer.from(rawKey, 'base64')
  if (key.length !== 32) throw new Error('AI_CREDENTIAL_ENCRYPTION_KEY must be a base64-encoded 32-byte key.')
  return key
}

export function encryptCredential(value: string) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(algorithm, encryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return { ciphertext: `${iv.toString('base64')}.${tag.toString('base64')}.${ciphertext.toString('base64')}`, keyVersion }
}

export function decryptCredential(value: string) {
  const [ivValue, tagValue, ciphertextValue] = value.split('.')
  if (!ivValue || !tagValue || !ciphertextValue) throw new Error('Invalid encrypted credential.')
  const decipher = crypto.createDecipheriv(algorithm, encryptionKey(), Buffer.from(ivValue, 'base64'))
  decipher.setAuthTag(Buffer.from(tagValue, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(ciphertextValue, 'base64')), decipher.final()]).toString('utf8')
}

export function credentialFingerprint(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 12)
}
