import crypto from 'node:crypto'

const algorithm = 'aes-256-gcm'
const legacyKeyVersion = 'v1'

type KeyRing = Record<string, string>

export function currentCredentialKeyVersion() {
  return process.env.AI_CREDENTIAL_ENCRYPTION_KEY_VERSION || legacyKeyVersion
}

function configuredKeyRing(): KeyRing {
  const rawRing = process.env.AI_CREDENTIAL_ENCRYPTION_KEYS
  if (rawRing) {
    let parsed: unknown
    try { parsed = JSON.parse(rawRing) } catch { throw new Error('AI_CREDENTIAL_ENCRYPTION_KEYS must be a JSON object of key versions to base64 keys.') }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('AI_CREDENTIAL_ENCRYPTION_KEYS must be a JSON object.')
    return parsed as KeyRing
  }

  const legacyKey = process.env.AI_CREDENTIAL_ENCRYPTION_KEY
  return legacyKey ? { [legacyKeyVersion]: legacyKey } : {}
}

function encryptionKey(version: string) {
  const rawKey = configuredKeyRing()[version]
  if (!rawKey) throw new Error(`No encryption key is configured for credential key version ${version}.`)
  const key = Buffer.from(rawKey, 'base64')
  if (key.length !== 32) throw new Error(`Credential key version ${version} must be a base64-encoded 32-byte key.`)
  return key
}

export function encryptCredential(value: string) {
  const keyVersion = currentCredentialKeyVersion()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(algorithm, encryptionKey(keyVersion), iv)
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return { ciphertext: `${iv.toString('base64')}.${tag.toString('base64')}.${ciphertext.toString('base64')}`, keyVersion }
}

export function decryptCredential(value: string, keyVersion = legacyKeyVersion) {
  const [ivValue, tagValue, ciphertextValue] = value.split('.')
  if (!ivValue || !tagValue || !ciphertextValue) throw new Error('Invalid encrypted credential.')
  const decipher = crypto.createDecipheriv(algorithm, encryptionKey(keyVersion), Buffer.from(ivValue, 'base64'))
  decipher.setAuthTag(Buffer.from(tagValue, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(ciphertextValue, 'base64')), decipher.final()]).toString('utf8')
}

export function credentialFingerprint(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 12)
}
