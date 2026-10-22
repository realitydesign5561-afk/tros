import { prisma } from '@/lib/prisma';
import { executeWithFallback } from '@/lib/aiGateway';
import { imageService } from './ImageService';

export class DesignerAgent {
  /**
   * designer.chat: Interprets the user's conversational request.
   */
  async chat(sessionId: string, message: string) {
    const session = await prisma.designSession.findUnique({
      where: { id: sessionId },
      include: { design: { include: { versions: true } } },
    });
    if (!session) throw new Error('Session not found');

    let intent = 'GENERATE';
    try {
      const completion = await executeWithFallback({
        capability: 'TEXT_GENERATION',
        prompt: `Classify the user intent into one of: GENERATE, EDIT, RESIZE, REMOVE_BACKGROUND. User message: "${message}". Return only the classification word.`,
        systemPrompt: 'You are an AI Designer. Classify the user intent.',
      });
      intent = completion.output?.toUpperCase() || 'GENERATE';
    } catch {
      intent = 'GENERATE';
    }

    const lastVersion = session.design.versions[session.design.versions.length - 1];
    let newAssetUrl = '';

    if (intent.includes('EDIT') && lastVersion) {
      newAssetUrl = await imageService.editImage(lastVersion.assetUrl, message);
    } else if (intent.includes('RESIZE') && lastVersion) {
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
      },
    });

    // Update Design active output
    await prisma.design.update({
      where: { id: session.design.id },
      data: { outputUrl: newAssetUrl },
    });

    return { response: 'Design updated successfully.', version: newVersion };
  }

  // Implementation of specific generation endpoints
  async generateLogo(prompt: string) {
    return imageService.generateImage(prompt, 'png');
  }

  async generateFlyer(prompt: string) {
    return imageService.generateImage(prompt, 'png');
  }

  async generateSocialPost(prompt: string) {
    return imageService.generateImage(prompt, 'png');
  }

  async generateThumbnail(prompt: string) {
    return imageService.generateImage(prompt, 'png');
  }

  /**
   * Identifies layout/hierarchy of an uploaded reference image.
   */
  async analyzeReference(imageUrl: string, isOwned: boolean) {
    if (isOwned) {
      return {
        instruction: 'Preserve exact layout, font relationships, and visual hierarchy. Only alter requested content and colors.',
      };
    }
    return {
      instruction: 'Use as visual inspiration only. Create an original composition with editorial typography. Do NOT copy protected artwork.',
    };
  }
}

export const designerAgent = new DesignerAgent();
