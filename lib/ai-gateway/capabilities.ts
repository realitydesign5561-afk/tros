export const AI_CAPABILITIES = [
  'TEXT_GENERATION',
  'REASONING',
  'CODE_GENERATION',
  'WEB_RESEARCH',
  'IMAGE_GENERATION',
  'IMAGE_EDITING',
  'VIDEO_GENERATION',
  'VOICE_GENERATION',
  'EMBEDDINGS',
  'VISION',
  'WEBSITE_GENERATION',
  'BROWSER_AUTOMATION',
] as const

export type AiCapability = typeof AI_CAPABILITIES[number]

export function normalizeCapabilities(value: unknown): AiCapability[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is AiCapability => typeof item === 'string' && AI_CAPABILITIES.includes(item as AiCapability))
}

export function supportsCapability(value: unknown, capability: AiCapability) {
  return normalizeCapabilities(value).includes(capability)
}
