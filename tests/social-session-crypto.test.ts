import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import test from 'node:test'
import { decryptSession, encryptSession } from '../lib/crypto'

test('social session writes use authenticated encryption and reject tampering', () => {
  const previous = process.env.SOCIAL_ENCRYPTION_KEY
  process.env.SOCIAL_ENCRYPTION_KEY = Buffer.alloc(32, 41).toString('base64')
  try {
    const encrypted = encryptSession('{"cookies":[]}')
    assert.equal(encrypted.split(':')[0], 'v2')
    assert.equal(decryptSession(encrypted), '{"cookies":[]}')
    assert.throws(() => decryptSession(`${encrypted.slice(0, -2)}00`))
  } finally {
    if (previous === undefined) delete process.env.SOCIAL_ENCRYPTION_KEY
    else process.env.SOCIAL_ENCRYPTION_KEY = previous
  }
})

test('legacy social session ciphertext remains readable during migration', () => {
  const previous = process.env.SOCIAL_ENCRYPTION_KEY
  delete process.env.SOCIAL_ENCRYPTION_KEY
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.alloc(32), iv)
    const ciphertext = `${iv.toString('hex')}:${cipher.update('legacy-state', 'utf8', 'hex')}${cipher.final('hex')}`
    assert.equal(decryptSession(ciphertext), 'legacy-state')
    assert.throws(() => encryptSession('new-state'), /SOCIAL_ENCRYPTION_KEY is required/)
  } finally {
    if (previous !== undefined) process.env.SOCIAL_ENCRYPTION_KEY = previous
  }
})
