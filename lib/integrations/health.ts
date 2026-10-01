import { prisma } from '@/lib/prisma'
import { resolveServerCredential } from '@/lib/ai-gateway/credentials'

type ProbeResult = { key: string; name: string; category: string; status: 'HEALTHY' | 'UNHEALTHY' | 'UNCONFIGURED' | 'UNVERIFIED'; latencyMs?: number; message: string }

async function probe(key: string, name: string, category: string, url: string, headers: HeadersInit): Promise<ProbeResult> {
  const started = Date.now()
  try {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(8_000), cache: 'no-store' })
    return { key, name, category, status: response.ok ? 'HEALTHY' : 'UNHEALTHY', latencyMs: Date.now() - started, message: response.ok ? 'Health check passed.' : `Provider returned HTTP ${response.status}.` }
  } catch (error) {
    return { key, name, category, status: 'UNHEALTHY', latencyMs: Date.now() - started, message: error instanceof Error && error.name === 'TimeoutError' ? 'Health check timed out.' : 'Provider health check failed.' }
  }
}

export async function checkExternalIntegrations(ownerId?: string): Promise<ProbeResult[]> {
  const checks: Promise<ProbeResult>[] = []
  const activepiecesUrl = process.env.ACTIVEPIECES_API_URL?.replace(/\/$/, '')
  const [activepiecesKey, resendKey, stripeKey, githubToken, vercelToken, socialWebhookSecret, youtubeToken] = await Promise.all([
    process.env.ACTIVEPIECES_API_KEY || resolveServerCredential(['activepieces', 'Activepieces'], ownerId).then((credential) => credential?.value),
    process.env.RESEND_API_KEY || resolveServerCredential(['resend', 'email', 'Email'], ownerId).then((credential) => credential?.value),
    process.env.STRIPE_SECRET_KEY || resolveServerCredential(['stripe', 'Stripe'], ownerId).then((credential) => credential?.value),
    process.env.GITHUB_TOKEN || resolveServerCredential(['github', 'GitHub'], ownerId).then((credential) => credential?.value),
    process.env.VERCEL_TOKEN || resolveServerCredential(['vercel', 'Vercel'], ownerId).then((credential) => credential?.value),
    process.env.SOCIAL_PUBLISH_WEBHOOK_SECRET || resolveServerCredential(['social-publish-webhook', 'social-publisher'], ownerId).then((credential) => credential?.value),
    process.env.YOUTUBE_ACCESS_TOKEN || resolveServerCredential(['youtube', 'youtube-data-api'], ownerId).then((credential) => credential?.value),
  ])
  if (activepiecesUrl && activepiecesKey) checks.push(probe('activepieces', 'Activepieces', 'workflow', `${activepiecesUrl}/api/v1/flows`, { Authorization: `Bearer ${activepiecesKey}` }))
  else checks.push(Promise.resolve({ key: 'activepieces', name: 'Activepieces', category: 'workflow', status: 'UNCONFIGURED', message: 'Configure ACTIVEPIECES_API_URL and ACTIVEPIECES_API_KEY.' }))

  if (resendKey && process.env.RESEND_FROM_EMAIL) checks.push(probe('resend', 'Resend', 'email', 'https://api.resend.com/domains', { Authorization: `Bearer ${resendKey}` }))
  else checks.push(Promise.resolve({ key: 'resend', name: 'Resend', category: 'email', status: 'UNCONFIGURED', message: 'Configure an encrypted Resend credential and RESEND_FROM_EMAIL to enable email delivery.' }))

  if (stripeKey) checks.push(probe('stripe', 'Stripe', 'payments', 'https://api.stripe.com/v1/account', { Authorization: `Basic ${Buffer.from(`${stripeKey}:`).toString('base64')}` }))
  else checks.push(Promise.resolve({ key: 'stripe', name: 'Stripe', category: 'payments', status: 'UNCONFIGURED', message: 'Configure STRIPE_SECRET_KEY to enable payments.' }))

  if (githubToken) checks.push(probe('github', 'GitHub', 'source-control', 'https://api.github.com/user', { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github+json' }))
  else checks.push(Promise.resolve({ key: 'github', name: 'GitHub', category: 'source-control', status: 'UNCONFIGURED', message: 'Configure GITHUB_TOKEN to enable repository publishing.' }))

  if (vercelToken) checks.push(probe('vercel', 'Vercel', 'deployment', 'https://api.vercel.com/v2/user', { Authorization: `Bearer ${vercelToken}` }))
  else checks.push(Promise.resolve({ key: 'vercel', name: 'Vercel', category: 'deployment', status: 'UNCONFIGURED', message: 'Configure VERCEL_TOKEN to enable deployment.' }))

  const socialWebhookConfigured = Boolean(process.env.SOCIAL_PUBLISH_WEBHOOK_URL && socialWebhookSecret)
  checks.push(Promise.resolve({ key: 'social-publisher', name: 'Social publishing webhook', category: 'social', status: socialWebhookConfigured ? 'UNVERIFIED' : 'UNCONFIGURED', message: socialWebhookConfigured ? 'Authenticated webhook is configured; no safe health method is defined.' : 'Configure the webhook URL and authentication secret or encrypted credential.' }))
  checks.push(Promise.resolve({ key: 'youtube', name: 'YouTube Data API', category: 'video', status: youtubeToken ? 'UNVERIFIED' : 'UNCONFIGURED', message: youtubeToken ? 'Credential is present; OAuth health validation is not implemented.' : 'YouTube OAuth credentials are not configured.' }))

  const results = await Promise.all(checks)
  for (const result of results) {
    const integration = await prisma.integration.upsert({ where: { key: result.key }, create: { key: result.key, name: result.name, category: result.category, status: result.status }, update: { name: result.name, category: result.category, status: result.status } })
    const connection = await prisma.integrationConnection.findFirst({ where: { integrationId: integration.id, ownerId: null } })
    const metadata = { message: result.message, lastCheckedAt: new Date().toISOString() }
    if (connection) await prisma.integrationConnection.update({ where: { id: connection.id }, data: { status: result.status, lastCheckedAt: new Date(), metadata } })
    else await prisma.integrationConnection.create({ data: { integrationId: integration.id, status: result.status, lastCheckedAt: new Date(), metadata } })
  }
  return results
}
