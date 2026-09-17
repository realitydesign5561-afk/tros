export async function publishScheduledPost(input: { id: string; platform: string; caption: string; hashtags?: string | null; imageUrl?: string | null }) {
  const webhookUrl = process.env.SOCIAL_PUBLISH_WEBHOOK_URL
  if (!webhookUrl) throw new Error('SOCIAL_PUBLISH_WEBHOOK_URL is not configured.')
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(process.env.SOCIAL_PUBLISH_WEBHOOK_SECRET ? { Authorization: `Bearer ${process.env.SOCIAL_PUBLISH_WEBHOOK_SECRET}` } : {}) },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new Error(`Social publishing service returned ${response.status}.`)
  return response.text()
}
