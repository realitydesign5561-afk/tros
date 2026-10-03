import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { imageService } from './ImageService';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class DesignerAgent {
  /**
   * designer.chat: Interprets the user's conversational request.
   */
  async chat(sessionId: string, message: string) {
    const session = await prisma.designSession.findUnique({
      where: { id: sessionId },
      include: { design: { include: { versions: true } } }
    });
    if (!session) throw new Error('Session not found');

    // Use LLM to classify intent
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an AI Designer. Classify the user intent into one of: GENERATE, EDIT, RESIZE, REMOVE_BACKGROUND.' },
        { role: 'user', content: message }
      ]
    });
    
    const intent = completion.choices[0].message?.content?.toUpperCase() || 'GENERATE';
    const lastVersion = session.design.versions[session.design.versions.length - 1];

    let newAssetUrl = '';

    if (intent.includes('EDIT') && lastVersion) {
      newAssetUrl = await imageService.editImage(lastVersion.assetUrl, message);
    } else if (intent.includes('RESIZE') && lastVersion) {
      // Mock dimensions parsing
      newAssetUrl = await imageService.resize(lastVersion.assetUrl, 1080, 1350);
    } else if (intent.includes('REMOVE_BACKGROUND') && lastVersion) {
      newAssetUrl = await imageService.removeBackground(lastVersion.assetUrl);
    } else {
      newAssetUrl = await imageService.generateImage(message);
    }

    // Save new version
    const newVersion = await prisma.designVersion.create({
      data: {
        designId: session.design.id,
        assetUrl: newAssetUrl,
        prompt: message,
      }
    });

    // Update Design active output
    await prisma.design.update({
      where: { id: session.design.id },
      data: { outputUrl: newAssetUrl }
    });

    return { response: 'Design updated successfully.', version: newVersion };
  }

  // Implementation of specific generation endpoints
  async generateLogo(prompt: string) { return imageService.generateImage(prompt, 'png'); }
  async generateFlyer(prompt: string) { return imageService.generateImage(prompt, 'pdf'); }
  async generateSocialPost(prompt: string) { return imageService.generateImage(prompt, 'png'); }
  async generateThumbnail(prompt: string) { return imageService.generateImage(prompt, 'png'); }

  /**
   * Identifies layout/hierarchy of an uploaded image.
   * "If the user uploads a design they own... preserve layout, composition"
   */
  async analyzeReference(imageUrl: string, isOwned: boolean) {
    if (isOwned) {
      return { instruction: 'Preserve exact layout, font relationships, and visual hierarchy. Only alter requested content and colors.' };
    }
    return { instruction: 'Use as visual inspiration only. Create an original composition. Do NOT copy protected artwork.' };
  }
}
