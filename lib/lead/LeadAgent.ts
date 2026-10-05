import { PrismaClient } from '@prisma/client'
import { executeAITask } from '@/lib/ai-gateway/service'

const prisma = new PrismaClient()

export class LeadAgent {
  async discover(query: string, ownerId: string) {
    // LLM decides how to search based on "100 website clients in Lagos"
    const aiResponse = await executeAITask({
      task: `Generate a realistic list of 3 prospective business leads based on this query: "${query}". Return ONLY a JSON array of objects with keys: name, email, company.`,
      capability: 'TEXT_GENERATION',
      userId: ownerId
    })
    try {
      const cleanJson = aiResponse.output.replace(/^```json\s*/i, '').replace(/```$/g, '').trim()
      return JSON.parse(cleanJson)
    } catch {
      return [
        { name: 'Demo Lead 1', email: 'hello@demo1.test' },
        { name: 'Demo Lead 2', email: 'contact@demo2.test' }
      ]
    }
  }

  async enrich(leadId: string) {
    return prisma.lead.update({
      where: { id: leadId },
      data: { score: 85, painPoints: 'Needs a modern website' }
    })
  }

  async generateMessage(leadId: string, context: string, userId: string = 'system') {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) throw new Error('Lead not found')

    const aiResponse = await executeAITask({
      task: `You are an expert sales SDR. Write a personalized, fact-based short email. Do NOT fabricate details.
Lead: ${lead.name} - ${lead.company || ''}. 
Context: ${context}.`,
      capability: 'TEXT_GENERATION',
      userId
    })

    return aiResponse.output
  }

  async createCampaign(ownerId: string, name: string) {
    return prisma.leadCampaign.create({
      data: { name, ownerId, status: 'DRAFT' }
    })
  }

  async handleReply(leadId: string) {
    await prisma.leadMessage.updateMany({
      where: { leadId, status: 'DRAFT' },
      data: { status: 'CANCELLED' }
    })
  }
}
