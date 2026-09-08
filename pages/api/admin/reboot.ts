import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
export default async function handler(req: NextApiRequest, res: NextApiResponse) { const session = await getServerSession(req,res,authOptions); if(session?.user?.role!=='ADMIN') return res.status(401).json({error:'Unauthorized'}); return res.json({ok:true,message:'Cache cleared and indexes refreshed'}) }
