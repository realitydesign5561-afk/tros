import { resolveServerCredential } from '@/lib/ai-gateway/credentials'

export async function publishScheduledPost(input: { id: string; platform: string; caption: string; hashtags?: string | null; imageUrl?: string | null }, ownerId?: string) {
  const webhookUrl = process.env.SOCIAL_PUBLISH_WEBHOOK_URL
  if (!webhookUrl) throw new Error('SOCIAL_PUBLISH_WEBHOOK_URL is not configured.')
  const webhookSecret = process.env.SOCIAL_PUBLISH_WEBHOOK_SECRET || (await resolveServerCredential(['social-publish-webhook', 'social-publisher'], ownerId))?.value
  if (!webhookSecret) throw new Error('Social publishing webhook authentication is not configured.')
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${webhookSecret}` },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new Error(`Social publishing service returned ${response.status}.`)
  return response.text()
}
