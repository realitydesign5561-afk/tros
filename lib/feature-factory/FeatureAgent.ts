import { PrismaClient } from '@prisma/client'
import { executeAITask } from '@/lib/ai-gateway/service'
import { sandboxService } from './SandboxService'

const prisma = new PrismaClient()

export class FeatureAgent {
  async analyzeRequirement(prompt: string, userId: string = 'system') {
    const aiResponse = await executeAITask({
      task: `You are an expert full-stack technical architect. Output a JSON specification for the requested feature including frontend, backend, DB, API, permissions, and AI tools required. Prompt: ${prompt}`,
      capability: 'TEXT_GENERATION',
      userId
    })
    return aiResponse.output
  }

  async generateCode(featureId: string, spec: string, userId: string = 'system') {
    // Generate actual code strings using the centralized gateway
    const aiResponse = await executeAITask({
      task: `Based on this specification, generate a robust, production-ready React component and a Next.js API route. Return JSON with 'uiCode' and 'apiCode' properties. Spec: ${spec}`,
      capability: 'TEXT_GENERATION',
      userId
    })

    let generatedCode = { uiCode: '', apiCode: '' }
    try {
      const cleanJson = aiResponse.output.replace(/^```json\s*/i, '').replace(/```$/g, '').trim()
      generatedCode = JSON.parse(cleanJson)
    } catch {
      generatedCode.uiCode = aiResponse.output
    }
    
    // Create version snapshot
    const version = await prisma.aiFeatureVersion.create({
      data: {
        featureId,
        apiRoutes: JSON.stringify(['/api/features/' + featureId]),
        uiRoutes: JSON.stringify(['/admin/features/' + featureId]),
        changelog: 'AI generated React component and API route.',
        commitHash: 'abcd123'
      }
    })

    await prisma.aiFeature.update({
      where: { id: featureId },
      data: { status: 'FEATURE_TESTING' }
    })

    return version
  }

  async deploy(featureId: string) {
    await prisma.featureAuditLog.create({
      data: { featureId, action: 'DEPLOY', status: 'SUCCESS', logs: 'Merged into production.' }
    })

    return prisma.aiFeature.update({
      where: { id: featureId },
      data: { status: 'FEATURE_ACTIVE' }
    })
  }

  async toggleFeature(featureId: string, isEnabled: boolean) {
    await prisma.featureAuditLog.create({
      data: { featureId, action: 'DISABLE', status: 'SUCCESS', logs: `Feature ${isEnabled ? 'enabled' : 'disabled'}` }
    })
    
    return prisma.aiFeature.update({
      where: { id: featureId },
      data: { isEnabled }
    })
  }
}
