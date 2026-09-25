import assert from 'node:assert/strict'
import test from 'node:test'
import { canTransitionTask, recoverableTaskStatus, transitionTask } from '../lib/foundation/task-state'
import type { ProviderAdapter } from '../lib/foundation/adapters'

test('task state machine permits durable execution transitions', () => {
  assert.equal(transitionTask('QUEUED', 'RUNNING'), 'RUNNING')
  assert.equal(transitionTask('RUNNING', 'SUCCEEDED'), 'SUCCEEDED')
  assert.equal(transitionTask('FAILED', 'QUEUED'), 'QUEUED')
  assert.equal(recoverableTaskStatus('FAILED'), true)
  assert.equal(recoverableTaskStatus('SUCCEEDED'), false)
})

test('task state machine rejects terminal state mutation', () => {
  assert.equal(canTransitionTask('SUCCEEDED', 'RUNNING'), false)
  assert.throws(() => transitionTask('SUCCEEDED', 'RUNNING'), /Invalid task transition/)
})

test('provider adapter contract exposes durable execution boundaries', () => {
  const adapter: ProviderAdapter<{ value: string }, { value: string }> = {
    async health() {
      return { status: 'healthy', checkedAt: new Date() }
    },
    async capabilities() {
      return { key: 'test', operations: ['execute'], supportsAsync: true }
    },
    async execute(input) {
      return { output: { value: input.value } }
    },
  }

  assert.equal(typeof adapter.health, 'function')
  assert.equal(typeof adapter.capabilities, 'function')
  assert.equal(typeof adapter.execute, 'function')
})
