import { prisma } from './prisma'
import { encryptSession, decryptSession } from './crypto'

const PLATFORM_URLS: Record<string, string> = {
  linkedin: 'https://www.linkedin.com/login',
  instagram: 'https://www.instagram.com/accounts/login',
  threads: 'https://www.threads.net/login',
}

export async function getSocialSession(userId: string, platform: string) {
  const session = await prisma.socialSession.findUnique({
    where: {
      ownerId_platform: { ownerId: userId, platform },
    },
  })

  if (!session) return null

  try {
    const storageState = JSON.parse(decryptSession(session.storageState))
    return {
      ...session,
      storageState,
    }
  } catch {
    return session
  }
}

export async function saveSocialSession(
  userId: string,
  platform: string,
  storageState: any,
  accountId?: string,
  accountName?: string
) {
  const encrypted = encryptSession(JSON.stringify(storageState))

  await prisma.socialSession.upsert({
    where: { ownerId_platform: { ownerId: userId, platform } },
    create: {
      ownerId: userId,
      platform,
      storageState: encrypted,
      accountId,
      accountName,
    },
    update: {
      storageState: encrypted,
      accountId,
      accountName,
      lastCheckedAt: new Date(),
    },
  })
}

export async function deleteSocialSession(userId: string, platform: string) {
  await prisma.socialSession.delete({
    where: { ownerId_platform: { ownerId: userId, platform } },
  }).catch(() => null)
}

export async function listSocialSessions(userId: string) {
  return prisma.socialSession.findMany({
    where: { ownerId: userId },
    select: {
      platform: true,
      status: true,
      accountId: true,
      accountName: true,
      lastCheckedAt: true,
    },
  })
}

export function getPlatformLoginUrl(platform: string): string {
  return PLATFORM_URLS[platform.toLowerCase()] || ''
}

export const SUPPORTED_PLATFORMS = ['linkedin', 'instagram', 'threads']
