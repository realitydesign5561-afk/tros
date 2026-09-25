import assert from 'node:assert/strict'
import test from 'node:test'
import { classifyProviderError, isCircuitOpen, isRetryableProviderError, ProviderExecutionError, selectProviders, type RoutingProvider } from '../lib/ai-gateway/router'

function provider(overrides: Partial<RoutingProvider> = {}): RoutingProvider {
  return { id: 'provider', priority: 100, fallbackPriority: 100, status: 'ACTIVE', circuitState: 'CLOSED', circuitOpenedAt: null, capabilities: ['TEXT_GENERATION'], dailyLimit: null, monthlyLimit: null, maxSpend: null, dailySpend: 0, monthlySpend: 0, totalSpend: 0, consecutiveFailures: 0, lastSuccessAt: null, ...overrides }
}

test('selects the highest-priority compatible provider', () => {
  const selected = selectProviders([provider({ id: 'fallback', priority: 200 }), provider({ id: 'primary', priority: 10 })], 'TEXT_GENERATION')
  assert.deepEqual(selected.map((item) => item.provider.id), ['primary', 'fallback'])
})

test('uses fallback providers after a primary provider failure', () => {
  const failure = new ProviderExecutionError(503, 'temporarily unavailable')
  assert.equal(classifyProviderError(failure), 'PROVIDER_UNAVAILABLE')
  assert.equal(isRetryableProviderError(failure), true)
  const selected = selectProviders([provider({ id: 'primary', priority: 1 }), provider({ id: 'fallback', priority: 2 })], 'TEXT_GENERATION')
  assert.equal(selected[1].reason, 'fallback-compatible-provider')
})

test('excludes providers that have exhausted quota or configured spend limits', () => {
  const selected = selectProviders([provider({ id: 'quota', dailyLimit: 1, dailySpend: 1 }), provider({ id: 'available', dailyLimit: 1, dailySpend: 0 })], 'TEXT_GENERATION')
  assert.deepEqual(selected.map((item) => item.provider.id), ['available'])
  assert.equal(classifyProviderError(new ProviderExecutionError(429, 'rate limited')), 'QUOTA_OR_RATE_LIMIT')
})

test('classifies timeout and invalid credential failures correctly', () => {
  const timeout = new ProviderExecutionError(408, 'timeout')
  const invalid = new ProviderExecutionError(401, 'invalid key')
  assert.equal(classifyProviderError(timeout), 'TIMEOUT')
  assert.equal(isRetryableProviderError(timeout), true)
  assert.equal(classifyProviderError(invalid), 'INVALID_CREDENTIALS')
  assert.equal(isRetryableProviderError(invalid), false)
})

test('reports all providers unavailable when no routing decision exists', () => {
  const selected = selectProviders([provider({ status: 'DISABLED' }), provider({ id: 'open', circuitState: 'OPEN', circuitOpenedAt: new Date() })], 'TEXT_GENERATION')
  assert.equal(selected.length, 0)
})

test('allows successful recovery after circuit cooldown', () => {
  const openedAt = new Date('2026-09-25T00:00:00.000Z')
  const blocked = selectProviders([provider({ circuitState: 'OPEN', circuitOpenedAt: openedAt })], 'TEXT_GENERATION', new Date('2026-09-25T00:00:30.000Z'))
  const recovered = selectProviders([provider({ circuitState: 'OPEN', circuitOpenedAt: openedAt })], 'TEXT_GENERATION', new Date('2026-09-25T00:02:00.000Z'))
  assert.equal(blocked.length, 0)
  assert.equal(recovered.length, 1)
  assert.equal(isCircuitOpen(provider({ circuitState: 'OPEN', circuitOpenedAt: openedAt }), new Date('2026-09-25T00:02:00.000Z')), false)
})
