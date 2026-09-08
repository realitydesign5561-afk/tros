import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
export default async function handler(req: NextApiRequest, res: NextApiResponse) { const session = await getServerSession(req,res,authOptions); if(session?.user?.role!=='ADMIN') return res.status(401).json({error:'Unauthorized'}); const [users,projects,events,apiKeys]=await Promise.all([prisma.user.findMany({select:{id:true,email:true,name:true,role:true,createdAt:true}}),prisma.project.findMany(),prisma.analyticsEvent.findMany(),prisma.apiKey.findMany({select:{id:true,provider:true,label:true,createdAt:true}})]); return res.json({users,projects,analyticsEvents:events,apiKeys}) }
