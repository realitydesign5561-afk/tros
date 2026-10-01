import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'

const testDatabaseUrl = process.env.TROS_TEST_DATABASE_URL

test('concurrent agent submissions with one idempotency key create one task', { skip: !testDatabaseUrl }, async () => {
  const { loadEnvConfig } = await import('@next/env')
  loadEnvConfig(process.cwd())
  process.env.NEON_DATABASE_URL = testDatabaseUrl
  const { prisma } = await import('../lib/prisma')
  const { createAgentTask } = await import('../lib/agent/runtime')
  const userId = `phase1-test-${randomUUID()}`
  const idempotencyKey = randomUUID()

  try {
    const submissions = await Promise.all([
      createAgentTask({ userId, prompt: 'Integration test request A', idempotencyKey }),
      createAgentTask({ userId, prompt: 'Integration test request B', idempotencyKey }),
    ])

    assert.equal(submissions[0].id, submissions[1].id)
    assert.equal(await prisma.agentTask.count({ where: { userId, idempotencyKey } }), 1)
    assert.equal(await prisma.agentMessage.count({ where: { taskId: submissions[0].id } }), 1)
    assert.equal(await prisma.agentEvent.count({ where: { taskId: submissions[0].id, type: 'queued' } }), 1)
  } finally {
    await prisma.agentTask.deleteMany({ where: { userId } })
    await prisma.$disconnect()
  }
})
