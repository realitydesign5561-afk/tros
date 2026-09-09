import { z } from 'zod'

const apiUrl = process.env.ACTIVEPIECES_API_URL?.replace(/\/$/, '')
const apiKey = process.env.ACTIVEPIECES_API_KEY

export class ActivepiecesConfigError extends Error {
  constructor() {
    super('Activepieces is not configured. Add ACTIVEPIECES_API_URL and ACTIVEPIECES_API_KEY to enable cloud runs.')
    this.name = 'ActivepiecesConfigError'
  }
}

function requireConfig() {
  if (!apiUrl || !apiKey) throw new ActivepiecesConfigError()
  return { apiUrl, apiKey }
}

async function request<T>(path: string, init: RequestInit = {}) {
  const config = requireConfig()
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

export async function createWorkflow(input: { name: string; graph: unknown }) {
  return externalWorkflowSchema.parse(await request('/api/v1/flows', { method: 'POST', body: JSON.stringify({ displayName: input.name, metadata: input.graph }) }))
}

export async function updateWorkflow(id: string, input: { name: string; graph: unknown }) {
  return externalWorkflowSchema.parse(await request(`/api/v1/flows/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ displayName: input.name, metadata: input.graph }) }))
}

export async function runWorkflow(id: string) {
  return externalWorkflowSchema.parse(await request(`/api/v1/flows/${encodeURIComponent(id)}/run`, { method: 'POST', body: JSON.stringify({}) }))
}

export async function getWorkflowStatus(id: string) {
  return externalWorkflowSchema.parse(await request(`/api/v1/flows/${encodeURIComponent(id)}`))
}

export function isActivepiecesConfigured() {
  return Boolean(apiUrl && apiKey)
}
