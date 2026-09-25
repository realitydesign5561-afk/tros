import type { AiCapability } from './capabilities'

export type RoutingProvider = {
  id: string
  priority: number
  fallbackPriority: number
  status: string
  circuitState: string
  circuitOpenedAt: Date | null
  capabilities: unknown
  dailyLimit: number | null
  monthlyLimit: number | null
  maxSpend: number | null
  dailySpend: number
  monthlySpend: number
  totalSpend: number
  consecutiveFailures: number
  lastSuccessAt: Date | null
}

export type RoutingDecision = {
  provider: RoutingProvider
  reason: string
}

export function isCircuitOpen(provider: RoutingProvider, now = new Date(), cooldownMs = 60_000) {
  if (provider.circuitState !== 'OPEN') return false
  return provider.circuitOpenedAt ? now.getTime() - provider.circuitOpenedAt.getTime() < cooldownMs : true
}

export function isWithinLimits(provider: RoutingProvider) {
  return (provider.dailyLimit === null || provider.dailySpend < provider.dailyLimit)
    && (provider.monthlyLimit === null || provider.monthlySpend < provider.monthlyLimit)
    && (provider.maxSpend === null || provider.totalSpend < provider.maxSpend)
}

export function selectProviders(providers: RoutingProvider[], capability: AiCapability, now = new Date()): RoutingDecision[] {
  return providers
    .filter((provider) => provider.status === 'ACTIVE')
    .filter((provider) => Array.isArray(provider.capabilities) && provider.capabilities.includes(capability))
    .filter((provider) => !isCircuitOpen(provider, now))
    .filter(isWithinLimits)
    .sort((left, right) => left.priority - right.priority || left.fallbackPriority - right.fallbackPriority || right.lastSuccessAt?.getTime()! - left.lastSuccessAt?.getTime()!)
    .map((provider, index) => ({ provider, reason: index === 0 ? 'highest-priority-compatible-provider' : 'fallback-compatible-provider' }))
}

export type RetryPolicy = {
  maxAttempts: number
  baseDelayMs: number
}

export const defaultRetryPolicy: RetryPolicy = { maxAttempts: 2, baseDelayMs: 250 }

export function isRetryableProviderError(error: unknown) {
  const status = error instanceof ProviderExecutionError ? error.status : undefined
  return status === 408 || status === 409 || status === 425 || status === 429 || status === undefined || status >= 500
}

export function classifyProviderError(error: unknown) {
  const status = error instanceof ProviderExecutionError ? error.status : undefined
  if (status === 401 || status === 403) return 'INVALID_CREDENTIALS'
  if (status === 408) return 'TIMEOUT'
  if (status === 429) return 'QUOTA_OR_RATE_LIMIT'
  if (status && status >= 500) return 'PROVIDER_UNAVAILABLE'
  return 'PROVIDER_ERROR'
}

export class ProviderExecutionError extends Error {
  constructor(public readonly status: number | undefined, message: string) {
    super(message)
    this.name = 'ProviderExecutionError'
  }
}
