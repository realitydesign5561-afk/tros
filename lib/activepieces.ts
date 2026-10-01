import { z } from 'zod'
import { resolveServerCredential } from '@/lib/ai-gateway/credentials'

const apiUrl = process.env.ACTIVEPIECES_API_URL?.replace(/\/$/, '')

export class ActivepiecesConfigError extends Error {
  constructor() {
    super('Activepieces is not configured. Add ACTIVEPIECES_API_URL and ACTIVEPIECES_API_KEY to enable cloud runs.')
    this.name = 'ActivepiecesConfigError'
  }
}

async function requireConfig(ownerId?: string) {
  const apiKey = process.env.ACTIVEPIECES_API_KEY || (await resolveServerCredential(['activepieces', 'Activepieces'], ownerId))?.value
  if (!apiUrl || !apiKey) throw new ActivepiecesConfigError()
  return { apiUrl, apiKey }
}

async function request<T>(path: string, init: RequestInit = {}, ownerId?: string) {
  const config = await requireConfig(ownerId)
  const response = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
      ...init.headers,
    },
  })
  const body = await response.text()
  let parsed: unknown = null
  try { parsed = body ? JSON.parse(body) : null } catch { parsed = body }
  if (!response.ok) throw new Error(`Activepieces request failed (${response.status})`)
  return parsed as T
}

const externalWorkflowSchema = z.object({ id: z.string().optional(), status: z.string().optional() }).passthrough()

export async function createWorkflow(input: { name: string; graph: unknown }, ownerId?: string) {
  return externalWorkflowSchema.parse(await request('/api/v1/flows', { method: 'POST', body: JSON.stringify({ displayName: input.name, metadata: input.graph }) }, ownerId))
}

export async function updateWorkflow(id: string, input: { name: string; graph: unknown }, ownerId?: string) {
  return externalWorkflowSchema.parse(await request(`/api/v1/flows/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ displayName: input.name, metadata: input.graph }) }, ownerId))
}

export async function runWorkflow(id: string, ownerId?: string) {
  return externalWorkflowSchema.parse(await request(`/api/v1/flows/${encodeURIComponent(id)}/run`, { method: 'POST', body: JSON.stringify({}) }, ownerId))
}

export async function getWorkflowStatus(id: string, ownerId?: string) {
  return externalWorkflowSchema.parse(await request(`/api/v1/flows/${encodeURIComponent(id)}`, {}, ownerId))
}

export async function isActivepiecesConfigured(ownerId?: string) {
  if (!apiUrl) return false
  if (process.env.ACTIVEPIECES_API_KEY) return true
  try { return Boolean(await resolveServerCredential(['activepieces', 'Activepieces'], ownerId)) } catch { return false }
}
