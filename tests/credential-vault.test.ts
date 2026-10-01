import assert from 'node:assert/strict'
import test from 'node:test'
import { currentCredentialKeyVersion, decryptCredential, encryptCredential } from '../lib/ai-gateway/crypto'

test('credential ciphertext decrypts by stored key version during rotation', () => {
  const previousKeys = process.env.AI_CREDENTIAL_ENCRYPTION_KEYS
  const previousKey = process.env.AI_CREDENTIAL_ENCRYPTION_KEY
  const previousVersion = process.env.AI_CREDENTIAL_ENCRYPTION_KEY_VERSION
  const versionOne = Buffer.alloc(32, 11).toString('base64')
  const versionTwo = Buffer.alloc(32, 22).toString('base64')

  try {
    process.env.AI_CREDENTIAL_ENCRYPTION_KEYS = JSON.stringify({ v1: versionOne, v2: versionTwo })
    process.env.AI_CREDENTIAL_ENCRYPTION_KEY_VERSION = 'v1'
    const oldCredential = encryptCredential('credential-secret')

    process.env.AI_CREDENTIAL_ENCRYPTION_KEY_VERSION = 'v2'
    const rotatedCredential = encryptCredential('credential-secret')

    assert.equal(currentCredentialKeyVersion(), 'v2')
    assert.equal(oldCredential.keyVersion, 'v1')
    assert.equal(rotatedCredential.keyVersion, 'v2')
    assert.equal(decryptCredential(oldCredential.ciphertext, oldCredential.keyVersion), 'credential-secret')
    assert.equal(decryptCredential(rotatedCredential.ciphertext, rotatedCredential.keyVersion), 'credential-secret')
    assert.throws(() => decryptCredential(`${rotatedCredential.ciphertext.slice(0, -2)}xx`, 'v2'))
  } finally {
    if (previousKeys === undefined) delete process.env.AI_CREDENTIAL_ENCRYPTION_KEYS
    else process.env.AI_CREDENTIAL_ENCRYPTION_KEYS = previousKeys
    if (previousKey === undefined) delete process.env.AI_CREDENTIAL_ENCRYPTION_KEY
    else process.env.AI_CREDENTIAL_ENCRYPTION_KEY = previousKey
    if (previousVersion === undefined) delete process.env.AI_CREDENTIAL_ENCRYPTION_KEY_VERSION
    else process.env.AI_CREDENTIAL_ENCRYPTION_KEY_VERSION = previousVersion
  }
})
