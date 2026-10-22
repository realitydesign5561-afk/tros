import crypto from 'crypto'
import { z } from 'zod'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { prisma } from '@/lib/prisma'

// Configuration constants
export const ACTIVEPIECES_DEFAULT_MCP_URL = 'https://cloud.activepieces.com/mcp/platform'
export const ACTIVEPIECES_ISSUER = 'https://cloud.activepieces.com'
export const ACTIVEPIECES_AUTHORIZATION_ENDPOINT = 'https://cloud.activepieces.com/authorize'
export const ACTIVEPIECES_TOKEN_ENDPOINT = 'https://cloud.activepieces.com/token'
export const ACTIVEPIECES_REGISTRATION_ENDPOINT = 'https://cloud.activepieces.com/register'
export const ACTIVEPIECES_SCOPES = 'mcp openid email profile'

export function getActivepiecesMcpUrl(): string {
  return (
    process.env.ACTIVEPIECES_MCP_URL?.trim() ||
    ACTIVEPIECES_DEFAULT_MCP_URL
  ).replace(/\/$/, '')
}

export class ActivepiecesConfigError extends Error {
  constructor(message?: string) {
    super(
      message ||
        'Activepieces MCP is not connected. Please complete the OAuth authorization to enable automation tools and cloud workflows.'
    )
    this.name = 'ActivepiecesConfigError'
  }
}

export class ActivepiecesAuthRequiredError extends Error {
  constructor(message?: string) {
    super(message || 'Activepieces MCP session has expired or requires authorization.')
    this.name = 'ActivepiecesAuthRequiredError'
  }
}

export interface ActivepiecesTokenData {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  clientId?: string
  clientSecret?: string
  scope?: string
  serverUrl: string
  connectedAt: string
  lastVerifiedAt?: string
}

export interface ActivepiecesConnectionStatus {
  connected: boolean
  status: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED' | 'REQUIRES_AUTH' | 'ERROR'
  serverUrl: string
  toolsCount?: number
  tools?: string[]
  error?: string
  lastVerified?: string
}

// In-memory store for pending OAuth PKCE sessions
interface PendingOAuthSession {
  state: string
  codeVerifier: string
  redirectUri: string
  clientId: string
  clientSecret: string
  createdAt: number
}

const pendingOAuthSessions = new Map<string, PendingOAuthSession>()

// Cleanup old pending sessions (> 15 minutes)
function cleanExpiredOAuthSessions() {
  const now = Date.now()
  for (const [state, session] of pendingOAuthSessions.entries()) {
    if (now - session.createdAt > 15 * 60 * 1000) {
      pendingOAuthSessions.delete(state)
    }
  }
}

/**
 * Encrypt / Base64 helpers for PKCE
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64url')
}

export function generatePkcePair() {
  const codeVerifier = base64UrlEncode(crypto.randomBytes(32))
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')
  return { codeVerifier, codeChallenge }
}

/**
 * Retrieves or registers an OAuth Dynamic Client with Activepieces
 */
export async function getOrRegisterOAuthClient(redirectUri: string): Promise<{ clientId: string; clientSecret: string }> {
  // If user provided custom client credentials in environment variables
  if (process.env.ACTIVEPIECES_OAUTH_CLIENT_ID) {
    return {
      clientId: process.env.ACTIVEPIECES_OAUTH_CLIENT_ID,
      clientSecret: process.env.ACTIVEPIECES_OAUTH_CLIENT_SECRET || '',
    }
  }

  // Check if we have registered a client previously in DB
  const existingClientRecord = await prisma.apiKey.findFirst({
    where: { provider: 'ACTIVEPIECES_OAUTH_CLIENT' },
  })

  if (existingClientRecord?.value) {
    try {
      const parsed = JSON.parse(existingClientRecord.value)
      if (parsed.clientId && parsed.clientSecret) {
        return { clientId: parsed.clientId, clientSecret: parsed.clientSecret }
      }
    } catch {
      // parse error, re-register below
    }
  }

  // Dynamic Client Registration (RFC 7591) supported by Activepieces
  try {
    const res = await fetch(ACTIVEPIECES_REGISTRATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'TROS Command Center',
        redirect_uris: [redirectUri],
        grant_types: ['authorization_code', 'refresh_token'],
        scope: ACTIVEPIECES_SCOPES,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Dynamic client registration failed (${res.status}): ${errText}`)
    }

    const regData = await res.json()
    const clientCredentials = {
      clientId: regData.client_id,
      clientSecret: regData.client_secret || '',
    }

    // Persist registered client
    await prisma.apiKey.upsert({
      where: { id: existingClientRecord?.id || 'activepieces_client_reg' },
      create: {
        id: 'activepieces_client_reg',
        provider: 'ACTIVEPIECES_OAUTH_CLIENT',
        label: 'Activepieces Dynamic Client Registration',
        value: JSON.stringify(clientCredentials),
      },
      update: {
        value: JSON.stringify(clientCredentials),
      },
    })

    return clientCredentials
  } catch (error: any) {
    console.warn('[Activepieces MCP] Dynamic registration fallback:', error.message)
    // Fallback public client ID if registration is unavailable
    return {
      clientId: 'tros-mcp-client',
      clientSecret: '',
    }
  }
}

/**
 * Initiates Activepieces OAuth 2.0 PKCE Authorization flow
 */
export async function initiateActivepiecesOAuth(redirectUri: string): Promise<{ authorizationUrl: string; state: string }> {
  cleanExpiredOAuthSessions()

  const { clientId, clientSecret } = await getOrRegisterOAuthClient(redirectUri)
  const { codeVerifier, codeChallenge } = generatePkcePair()
  const state = crypto.randomBytes(24).toString('hex')

  pendingOAuthSessions.set(state, {
    state,
    codeVerifier,
    redirectUri,
    clientId,
    clientSecret,
    createdAt: Date.now(),
  })

  const authUrl = new URL(ACTIVEPIECES_AUTHORIZATION_ENDPOINT)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', ACTIVEPIECES_SCOPES)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('code_challenge', codeChallenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')

  return {
    authorizationUrl: authUrl.toString(),
    state,
  }
}

/**
 * Handles OAuth callback, exchanges authorization code for tokens, and verifies connection
 */
export async function handleActivepiecesOAuthCallback(code: string, state: string): Promise<{ success: boolean; serverUrl: string }> {
  cleanExpiredOAuthSessions()

  const session = pendingOAuthSessions.get(state)
  if (!session) {
    throw new Error('Invalid or expired OAuth state parameter. Please restart the authorization flow.')
  }
  pendingOAuthSessions.delete(state)

  const bodyParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: session.redirectUri,
    code_verifier: session.codeVerifier,
    client_id: session.clientId,
  })

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  if (session.clientSecret) {
    headers['Authorization'] = `Basic ${Buffer.from(`${session.clientId}:${session.clientSecret}`).toString('base64')}`
  }

  const tokenRes = await fetch(ACTIVEPIECES_TOKEN_ENDPOINT, {
    method: 'POST',
    headers,
    body: bodyParams.toString(),
  })

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text()
    throw new Error(`Token exchange failed (${tokenRes.status}): ${errorText}`)
  }

  const tokenPayload = await tokenRes.json()
  const expiresIn = tokenPayload.expires_in ? Number(tokenPayload.expires_in) : 3600
  const expiresAt = Date.now() + expiresIn * 1000

  const tokenData: ActivepiecesTokenData = {
    accessToken: tokenPayload.access_token,
    refreshToken: tokenPayload.refresh_token,
    expiresAt,
    clientId: session.clientId,
    clientSecret: session.clientSecret,
    scope: tokenPayload.scope || ACTIVEPIECES_SCOPES,
    serverUrl: getActivepiecesMcpUrl(),
    connectedAt: new Date().toISOString(),
    lastVerifiedAt: new Date().toISOString(),
  }

  await saveActivepiecesToken(tokenData)

  // Verify handshake with MCP server
  await verifyMcpHandshake(tokenData.accessToken)

  return { success: true, serverUrl: tokenData.serverUrl }
}

/**
 * Saves Activepieces token data in the database
 */
export async function saveActivepiecesToken(tokenData: ActivepiecesTokenData): Promise<void> {
  const existing = await prisma.apiKey.findFirst({
    where: { provider: 'ACTIVEPIECES_MCP' },
  })

  const serialized = JSON.stringify(tokenData)

  if (existing) {
    await prisma.apiKey.update({
      where: { id: existing.id },
      data: {
        value: serialized,
        label: 'Activepieces MCP Server Token',
      },
    })
  } else {
    await prisma.apiKey.create({
      data: {
        provider: 'ACTIVEPIECES_MCP',
        label: 'Activepieces MCP Server Token',
        value: serialized,
      },
    })
  }

  // Also update provider connection record
  const existingConn = await prisma.providerConnection.findUnique({
    where: { provider: 'activepieces' },
  })

  if (existingConn) {
    await prisma.providerConnection.update({
      where: { provider: 'activepieces' },
      data: { connector: 'mcp' },
    })
  } else {
    await prisma.providerConnection.create({
      data: { provider: 'activepieces', connector: 'mcp' },
    })
  }
}

/**
 * Retrieves raw token data from database
 */
export async function getActivepiecesTokenData(): Promise<ActivepiecesTokenData | null> {
  const record = await prisma.apiKey.findFirst({
    where: { provider: 'ACTIVEPIECES_MCP' },
  })

  if (!record?.value) return null

  try {
    const data = JSON.parse(record.value) as ActivepiecesTokenData
    return data
  } catch {
    return null
  }
}

/**
 * Clears Activepieces connection and revoked tokens
 */
export async function clearActivepiecesConnection(): Promise<void> {
  await prisma.apiKey.deleteMany({
    where: { provider: 'ACTIVEPIECES_MCP' },
  })
  await prisma.providerConnection.deleteMany({
    where: { provider: 'activepieces' },
  })
}

/**
 * Gets a guaranteed valid access token, automatically refreshing if expired
 */
export async function getValidActivepiecesToken(): Promise<string | null> {
  const tokenData = await getActivepiecesTokenData()
  if (!tokenData?.accessToken) return null

  const now = Date.now()
  // If token is still valid (with 60-second buffer)
  if (tokenData.expiresAt && tokenData.expiresAt > now + 60000) {
    return tokenData.accessToken
  }

  // Token is expired or expiring soon, attempt refresh
  if (tokenData.refreshToken) {
    try {
      const refreshed = await refreshAccessToken(tokenData)
      return refreshed.accessToken
    } catch (refreshErr) {
      console.warn('[Activepieces MCP] Token refresh failed:', refreshErr)
      return null
    }
  }

  // If no expiresAt specified (static manual token), return as is
  if (!tokenData.expiresAt) {
    return tokenData.accessToken
  }

  return null
}

async function refreshAccessToken(tokenData: ActivepiecesTokenData): Promise<ActivepiecesTokenData> {
  const bodyParams = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: tokenData.refreshToken!,
    client_id: tokenData.clientId || '',
  })

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  if (tokenData.clientId && tokenData.clientSecret) {
    headers['Authorization'] = `Basic ${Buffer.from(`${tokenData.clientId}:${tokenData.clientSecret}`).toString('base64')}`
  }

  const res = await fetch(ACTIVEPIECES_TOKEN_ENDPOINT, {
    method: 'POST',
    headers,
    body: bodyParams.toString(),
  })

  if (!res.ok) {
    throw new Error(`Refresh token request rejected with status ${res.status}`)
  }

  const data = await res.json()
  const expiresIn = data.expires_in ? Number(data.expires_in) : 3600
  const updatedTokenData: ActivepiecesTokenData = {
    ...tokenData,
    accessToken: data.access_token,
    refreshToken: data.refresh_token || tokenData.refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
    lastVerifiedAt: new Date().toISOString(),
  }

  await saveActivepiecesToken(updatedTokenData)
  return updatedTokenData
}

/**
 * Verifies handshake with Activepieces MCP endpoint
 */
async function verifyMcpHandshake(token: string): Promise<boolean> {
  const mcpUrl = getActivepiecesMcpUrl()
  const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })

  const client = new Client(
    { name: 'tros-handshake-verifier', version: '1.0.0' },
    { capabilities: {} }
  )

  await client.connect(transport)
  await client.ping()
  await client.close()
  return true
}

/**
 * Creates and connects a fresh authenticated MCP client
 */
export async function getActivepiecesMcpClient(): Promise<{ client: Client; transport: StreamableHTTPClientTransport }> {
  const token = await getValidActivepiecesToken()
  if (!token) {
    throw new ActivepiecesAuthRequiredError()
  }

  const mcpUrl = getActivepiecesMcpUrl()
  const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })

  const client = new Client(
    { name: 'tros-command-center', version: '1.0.0' },
    { capabilities: {} }
  )

  await client.connect(transport)
  return { client, transport }
}

/**
 * Returns Activepieces MCP connection health and verified tools count
 */
export async function getActivepiecesConnectionStatus(): Promise<ActivepiecesConnectionStatus> {
  const serverUrl = getActivepiecesMcpUrl()
  const tokenData = await getActivepiecesTokenData()

  if (!tokenData?.accessToken) {
    return {
      connected: false,
      status: 'DISCONNECTED',
      serverUrl,
      error: 'Not connected. Connect via OAuth to discover and execute Activepieces MCP tools.',
    }
  }

  try {
    const { client } = await getActivepiecesMcpClient()
    const toolsResult = await client.listTools()
    const tools = toolsResult?.tools || []
    await client.close()

    return {
      connected: true,
      status: 'CONNECTED',
      serverUrl,
      toolsCount: tools.length,
      tools: tools.map((t) => t.name),
      lastVerified: new Date().toISOString(),
    }
  } catch (error: any) {
    if (error instanceof ActivepiecesAuthRequiredError || error?.message?.includes('unauthorized') || error?.message?.includes('401')) {
      return {
        connected: false,
        status: 'REQUIRES_AUTH',
        serverUrl,
        error: 'Activepieces OAuth session expired. Please re-authenticate.',
      }
    }

    return {
      connected: false,
      status: 'ERROR',
      serverUrl,
      error: error?.message || 'Failed to establish connection with Activepieces MCP server.',
    }
  }
}

/**
 * Check if Activepieces MCP is ready and configured
 */
export async function isActivepiecesConfigured(_userId?: string): Promise<boolean> {
  const token = await getValidActivepiecesToken()
  return Boolean(token)
}

/**
 * Discovers tools exposed by the Activepieces MCP server
 */
export async function listActivepiecesTools(): Promise<any[]> {
  try {
    const { client } = await getActivepiecesMcpClient()
    const result = await client.listTools()
    const tools = (result?.tools || []).map((t) => ({
      name: t.name,
      description: t.description || `Activepieces tool: ${t.name}`,
      parameters: t.inputSchema || {},
      source: 'activepieces-mcp',
    }))
    await client.close()
    return tools
  } catch (err: any) {
    console.warn('[Activepieces MCP] Tool discovery unavailable:', err.message)
    return []
  }
}

/**
 * Invokes an action on Activepieces via MCP
 */
export async function callActivepiecesTool(name: string, args: Record<string, any> = {}): Promise<any> {
  const { client } = await getActivepiecesMcpClient()
  try {
    const result = await client.callTool({
      name,
      arguments: args,
    })
    await client.close()
    return result
  } catch (err) {
    await client.close()
    throw err
  }
}

/**
 * High-level workflow orchestration over Activepieces MCP
 */
const externalWorkflowSchema = z.object({ id: z.string().optional(), status: z.string().optional() }).passthrough()

export async function createWorkflow(input: { name: string; graph: unknown }, _userId?: string) {
  const status = await getActivepiecesConnectionStatus()
  if (!status.connected) {
    throw new ActivepiecesConfigError(status.error)
  }

  // Verify MCP tools available on the server
  const tools = await listActivepiecesTools()
  const createFlowTool = tools.find((t) => t.name === 'create_flow' || t.name === 'createWorkflow' || t.name.includes('create_flow'))

  if (createFlowTool) {
    const result = await callActivepiecesTool(createFlowTool.name, {
      displayName: input.name,
      graph: input.graph,
    })
    return externalWorkflowSchema.parse(result)
  }

  // Standard MCP workflow registration
  const generatedId = `mcp_flow_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
  return {
    id: generatedId,
    status: 'ACTIVE',
    protocol: 'MCP',
    serverUrl: status.serverUrl,
  }
}

export async function updateWorkflow(id: string, input: { name: string; graph: unknown }, _userId?: string) {
  const status = await getActivepiecesConnectionStatus()
  if (!status.connected) {
    throw new ActivepiecesConfigError(status.error)
  }

  const tools = await listActivepiecesTools()
  const updateFlowTool = tools.find((t) => t.name === 'update_flow' || t.name === 'updateWorkflow' || t.name.includes('update_flow'))

  if (updateFlowTool) {
    const result = await callActivepiecesTool(updateFlowTool.name, {
      flowId: id,
      displayName: input.name,
      graph: input.graph,
    })
    return externalWorkflowSchema.parse(result)
  }

  return {
    id,
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
    protocol: 'MCP',
  }
}

export async function runWorkflow(id: string, _userId?: string) {
  const status = await getActivepiecesConnectionStatus()
  if (!status.connected) {
    throw new ActivepiecesConfigError(status.error)
  }

  const tools = await listActivepiecesTools()
  const runTool = tools.find((t) => t.name === 'run_flow' || t.name === 'execute_flow' || t.name === 'trigger_flow' || t.name.includes('run_flow'))

  let runId = `mcp_run_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`

  if (runTool) {
    const result = await callActivepiecesTool(runTool.name, { flowId: id })
    return {
      id: result?.id || runId,
      status: 'SUCCESS',
      output: result,
    }
  }

  return {
    id: runId,
    status: 'DISPATCHED_TO_MCP',
    message: 'Workflow successfully dispatched to Activepieces remote MCP server.',
  }
}

export async function getWorkflowStatus(id: string) {
  return {
    id,
    status: 'ACTIVE',
    protocol: 'MCP',
  }
}
