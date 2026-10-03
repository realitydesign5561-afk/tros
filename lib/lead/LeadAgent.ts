import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'mock-key-for-build' });

export class LeadAgent {
  /**
   * lead.research & lead.discover
   */
  async discover(query: string, ownerId: string) {
    // LLM decides how to search based on "100 website clients in Lagos"
    // Mocking finding leads
    return [
      { name: 'Tech Solutions Lagos', email: 'hello@techlagos.demo' },
      { name: 'Real Estate Naija', email: 'contact@naijarealestate.demo' }
    ];
  }

  /**
   * lead.enrich
   */
  async enrich(leadId: string) {
    // Scrape/API lookup for factual info
    return prisma.lead.update({
      where: { id: leadId },
      data: { score: 85, painPoints: 'Needs a modern website' }
    });
  }

  /**
   * lead.generateMessage
   */
  async generateMessage(leadId: string, context: string) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error('Lead not found');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert sales SDR. Write a personalized, fact-based email. Do NOT fabricate details.' },
        { role: 'user', content: `Lead: ${lead.name} - ${lead.company}. Context: ${context}. Write a short email.` }
      ]
    });

    return completion.choices[0].message?.content;
  }

  /**
   * lead.createCampaign
   */
  async createCampaign(ownerId: string, name: string) {
    return prisma.leadCampaign.create({
      data: { name, ownerId, status: 'DRAFT' }
    });
  }

  /**
   * lead.detectReply & stopSequence
   */
  async handleReply(leadId: string) {
    // If reply received, stop the sequence
    await prisma.leadMessage.updateMany({
      where: { leadId, status: 'DRAFT' },
      data: { status: 'CANCELLED' }
    });
    
    // Also mark the specific message as replied
    // (mocking marking the latest sent message as replied)
  }
}
