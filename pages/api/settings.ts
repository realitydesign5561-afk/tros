import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { hash } from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { credentialFingerprint, encryptCredential } from '@/lib/ai-gateway/crypto'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const session = await getServerSession(req, res, authOptions)
	if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })
	const { password, provider, value, label } = req.body
	if (password) await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: await hash(password, 12) } })
	if (provider && value) {
		const encrypted = encryptCredential(String(value))
		await prisma.credential.updateMany({ where: { ownerId: session.user.id, providerKey: provider, status: 'ACTIVE' }, data: { status: 'REVOKED' } })
		await prisma.credential.create({ data: { ownerId: session.user.id, providerKey: provider, label: label || provider, ciphertext: encrypted.ciphertext, keyVersion: encrypted.keyVersion, fingerprint: credentialFingerprint(String(value)) } })
	}
	return res.json({ ok: true })
}
