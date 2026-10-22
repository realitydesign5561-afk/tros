import { prisma } from './prisma'
import { encryptSession, decryptSession } from './crypto'

export const SUPPORTED_PLATFORMS = [
  'twitter',
  'linkedin',
  'instagram',
  'facebook',
  'tiktok',
  'threads',
]

const PLATFORM_URLS: Record<string, string> = {
  twitter: 'https://twitter.com/login',
  x: 'https://x.com/login',
  linkedin: 'https://www.linkedin.com/login',
  instagram: 'https://www.instagram.com/accounts/login',
  facebook: 'https://www.facebook.com/login',
  tiktok: 'https://www.tiktok.com/login',
  threads: 'https://www.threads.net/login',
}

export interface ManualSocialCredentials {
  usernameOrEmail: string
  password?: string
  accountName?: string
  loginType: 'manual'
  updatedAt: string
}

export async function getSocialSession(userId: string, platform: string) {
  const normPlatform = platform.toLowerCase() === 'x' ? 'twitter' : platform.toLowerCase()
  const session = await prisma.socialSession.findUnique({
    where: {
      ownerId_platform: { ownerId: userId, platform: normPlatform },
    },
  })

  if (!session || !session.storageState) return null

  try {
    const decrypted = decryptSession(session.storageState)
    const storageState = JSON.parse(decrypted)
    return {
      ...session,
      storageState,
    }
  } catch {
    return session
  }
}

export async function saveManualSocialCredentials(
  userId: string,
  platform: string,
  usernameOrEmail: string,
  password?: string,
  accountName?: string
) {
  const normPlatform = platform.toLowerCase() === 'x' ? 'twitter' : platform.toLowerCase()
  const payload: ManualSocialCredentials = {
    usernameOrEmail,
    password: password || '',
    accountName: accountName || usernameOrEmail,
    loginType: 'manual',
    updatedAt: new Date().toISOString(),
  }

  const encrypted = encryptSession(JSON.stringify(payload))
  const displayAccount = accountName || usernameOrEmail

  return prisma.socialSession.upsert({
    where: { ownerId_platform: { ownerId: userId, platform: normPlatform } },
    create: {
      ownerId: userId,
      platform: normPlatform,
      storageState: encrypted,
      accountId: usernameOrEmail,
      accountName: displayAccount,
      status: 'CONNECTED',
    },
    update: {
      storageState: encrypted,
      accountId: usernameOrEmail,
      accountName: displayAccount,
      status: 'CONNECTED',
      lastCheckedAt: new Date(),
    },
  })
}

export async function saveSocialSession(
  userId: string,
  platform: string,
  storageState: any,
  accountId?: string,
  accountName?: string
) {
  const normPlatform = platform.toLowerCase() === 'x' ? 'twitter' : platform.toLowerCase()
  const encrypted = encryptSession(JSON.stringify(storageState))

  await prisma.socialSession.upsert({
    where: { ownerId_platform: { ownerId: userId, platform: normPlatform } },
    create: {
      ownerId: userId,
      platform: normPlatform,
      storageState: encrypted,
      accountId,
      accountName: accountName || accountId || 'Account',
      status: 'CONNECTED',
    },
    update: {
      storageState: encrypted,
      accountId,
      accountName: accountName || accountId || 'Account',
      status: 'CONNECTED',
      lastCheckedAt: new Date(),
    },
  })
}

export async function deleteSocialSession(userId: string, platform: string) {
  const normPlatform = platform.toLowerCase() === 'x' ? 'twitter' : platform.toLowerCase()
  await prisma.socialSession.delete({
    where: { ownerId_platform: { ownerId: userId, platform: normPlatform } },
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
