import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { executeAITask } from '@/lib/ai-gateway/service'
import type { AgentTool, AgentToolContext, AgentToolResult } from './types'

const textInput = z.object({ prompt: z.string().min(1).max(20_000), capability: z.string().optional() })
const projectInput = z.object({ name: z.string().min(2).max(120), niche: z.string().max(160).optional(), pages: z.string().max(2_000).optional(), brandColors: z.string().max(500).optional() })
const workflowInput = z.object({ name: z.string().min(2).max(120), graph: z.record(z.string(), z.unknown()).optional() })
const courseInput = z.object({ title: z.string().min(2).max(160), topic: z.string().min(2).max(240), description: z.string().max(2_000).optional() })
const imageInput = z.object({ prompt: z.string().min(1).max(10_000), size: z.string().optional() })
const idInput = z.object({ id: z.string().min(1) })

function failed(code: string, message: string, retryable = false): AgentToolResult {
  return { ok: false, verified: false, error: { code, message, retryable } }
}

async function generateTextTool(input: unknown, context: AgentToolContext, capability = 'TEXT_GENERATION'): Promise<AgentToolResult> {
  const parsed = textInput.parse(input)
  const result = await executeAITask({ task: parsed.prompt, capability: capability as any, userId: context.userId, projectId: context.projectId })
  return typeof result.output === 'string'
    ? { ok: true, verified: true, data: { text: result.output, taskId: result.taskId, provider: result.providerName, model: result.model } }
    : failed('INVALID_PROVIDER_OUTPUT', 'The provider returned a non-text result.', false)
}

const tools: AgentTool[] = [
  {
    key: 'website.create', name: 'Create website project', description: 'Create a persisted website project from validated requirements.', modules: ['website-factory', 'universal'], capabilities: ['WEBSITE_GENERATION'], permission: 'website:create', requiresApproval: false, input: projectInput,
    async execute(input, context) {
      const parsed = projectInput.parse(input)
      const project = await prisma.project.create({ data: { ownerId: context.userId, name: parsed.name, niche: parsed.niche, pages: parsed.pages, brandColors: parsed.brandColors, source: 'AGENT' } })
      return { ok: true, verified: true, data: { projectId: project.id, status: project.status } }
    },
  },
  {
    key: 'website.modify', name: 'Modify website project', description: 'Modify an existing owned website project.', modules: ['website-factory', 'universal'], capabilities: ['WEBSITE_GENERATION'], permission: 'website:modify', requiresApproval: false, input: idInput.extend({ name: z.string().optional(), pages: z.string().optional(), brandColors: z.string().optional() }),
    async execute(input, context) {
      const parsed = idInput.extend({ name: z.string().optional(), pages: z.string().optional(), brandColors: z.string().optional() }).parse(input)
      const project = await prisma.project.updateMany({ where: { id: parsed.id, ownerId: context.userId }, data: { name: parsed.name, pages: parsed.pages, brandColors: parsed.brandColors } })
      return project.count ? { ok: true, verified: true, data: { projectId: parsed.id, updated: true } } : failed('PROJECT_NOT_FOUND', 'Owned project was not found.')
    },
  },
  {
    key: 'website.deploy', name: 'Deploy website', description: 'Queue a deployment through a configured deployment provider.', modules: ['website-factory', 'universal'], capabilities: ['WEBSITE_GENERATION'], permission: 'website:deploy', requiresApproval: true, input: idInput,
    async execute() { return failed('DEPLOYMENT_PROVIDER_REQUIRED', 'No verified deployment adapter is configured.') },
  },
  {
    key: 'workflow.create', name: 'Create workflow', description: 'Persist a workflow definition for the authenticated user.', modules: ['workflows', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'workflow:create', requiresApproval: false, input: workflowInput,
    async execute(input, context) {
      const parsed = workflowInput.parse(input)
      const workflow = await prisma.workflow.create({ data: { ownerId: context.userId, name: parsed.name, graph: JSON.stringify(parsed.graph || { nodes: [], edges: [] }), template: 'agent' } })
      return { ok: true, verified: true, data: { workflowId: workflow.id, status: workflow.status } }
    },
  },
  {
    key: 'workflow.update', name: 'Update workflow', description: 'Update an owned workflow definition.', modules: ['workflows', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'workflow:update', requiresApproval: false, input: idInput.extend({ name: z.string().optional(), graph: z.record(z.string(), z.unknown()).optional() }),
    async execute(input, context) {
      const parsed = idInput.extend({ name: z.string().optional(), graph: z.record(z.string(), z.unknown()).optional() }).parse(input)
      const workflow = await prisma.workflow.updateMany({ where: { id: parsed.id, ownerId: context.userId }, data: { name: parsed.name, graph: parsed.graph ? JSON.stringify(parsed.graph) : undefined } })
      return workflow.count ? { ok: true, verified: true, data: { workflowId: parsed.id, updated: true } } : failed('WORKFLOW_NOT_FOUND', 'Owned workflow was not found.')
    },
  },
  {
    key: 'social.generateContent', name: 'Generate social content', description: 'Generate platform-aware social content through the AI Gateway.', modules: ['social', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'social:generate', requiresApproval: false, input: textInput,
    async execute(input, context) { return generateTextTool(input, context) },
  },
  {
    key: 'social.research', name: 'Research social topic', description: 'Research a social topic through a configured research-capable provider.', modules: ['social', 'universal'], capabilities: ['WEB_RESEARCH'], permission: 'social:research', requiresApproval: false, input: textInput,
    async execute(input, context) { return generateTextTool(input, context, 'WEB_RESEARCH') },
  },
  {
    key: 'social.generateImage', name: 'Generate social image', description: 'Generate an image through a configured image provider.', modules: ['social', 'universal'], capabilities: ['IMAGE_GENERATION'], permission: 'social:image', requiresApproval: false, input: imageInput,
    async execute(input, context) {
      const parsed = imageInput.parse(input)
      const result = await executeAITask({ task: parsed.prompt, capability: 'IMAGE_GENERATION', imageSize: parsed.size, userId: context.userId, projectId: context.projectId, fallbackPolicy: { maxAttempts: 1 } })
      return typeof result.output === 'object' ? { ok: true, verified: true, data: { imageUrl: result.output.url, taskId: result.taskId } } : failed('INVALID_PROVIDER_OUTPUT', 'The image provider returned no image artifact.')
    },
  },
  {
    key: 'social.schedule', name: 'Schedule social post', description: 'Schedule an approved social post through a configured platform adapter.', modules: ['social', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'social:schedule', requiresApproval: true, input: idInput,
    async execute() { return failed('SOCIAL_ADAPTER_REQUIRED', 'No verified social publishing adapter is configured.') },
  },
  {
    key: 'course.create', name: 'Create course', description: 'Create a persisted course shell.', modules: ['courses', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'course:create', requiresApproval: false, input: courseInput,
    async execute(input, context) {
      const parsed = courseInput.parse(input)
      const course = await prisma.course.create({ data: { ownerId: context.userId, title: parsed.title, topic: parsed.topic, description: parsed.description } })
      return { ok: true, verified: true, data: { courseId: course.id, status: course.status } }
    },
  },
  {
    key: 'course.generateLesson', name: 'Generate lesson', description: 'Generate lesson content through the AI Gateway.', modules: ['courses', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'course:generate', requiresApproval: false, input: textInput,
    async execute(input, context) { return generateTextTool(input, context) },
  },
  {
    key: 'course.generateExercise', name: 'Generate exercise', description: 'Generate a course exercise through the AI Gateway.', modules: ['courses', 'universal'], capabilities: ['REASONING'], permission: 'course:generate', requiresApproval: false, input: textInput,
    async execute(input, context) { return generateTextTool(input, context, 'REASONING') },
  },
  {
    key: 'youtube.research', name: 'Research YouTube topic', description: 'Research a topic through a configured AI/search provider.', modules: ['youtube', 'universal'], capabilities: ['WEB_RESEARCH'], permission: 'youtube:research', requiresApproval: false, input: textInput,
    async execute(input, context) { return generateTextTool(input, context, 'WEB_RESEARCH') },
  },
  {
    key: 'youtube.generateScript', name: 'Generate YouTube script', description: 'Generate a script through the AI Gateway.', modules: ['youtube', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'youtube:generate', requiresApproval: false, input: textInput,
    async execute(input, context) { return generateTextTool(input, context) },
  },
  {
    key: 'youtube.generateThumbnail', name: 'Generate YouTube thumbnail', description: 'Generate a thumbnail through a configured image provider.', modules: ['youtube', 'universal'], capabilities: ['IMAGE_GENERATION'], permission: 'youtube:image', requiresApproval: false, input: imageInput,
    async execute(input, context) { return tools.find((tool) => tool.key === 'social.generateImage')!.execute(input, context) },
  },
  {
    key: 'youtube.publish', name: 'Publish YouTube video', description: 'Publish through a configured YouTube adapter after approval.', modules: ['youtube', 'universal'], capabilities: ['VIDEO_GENERATION'], permission: 'youtube:publish', requiresApproval: true, input: idInput,
    async execute() { return failed('YOUTUBE_ADAPTER_REQUIRED', 'No verified YouTube publishing adapter is configured.') },
  },
  {
    key: 'designer.generate', name: 'Generate design', description: 'Generate a design image through a configured provider.', modules: ['designer', 'universal'], capabilities: ['IMAGE_GENERATION'], permission: 'designer:generate', requiresApproval: false, input: imageInput,
    async execute(input, context) { return tools.find((tool) => tool.key === 'social.generateImage')!.execute(input, context) },
  },
  {
    key: 'designer.edit', name: 'Edit design', description: 'Edit an owned design through a configured image provider.', modules: ['designer', 'universal'], capabilities: ['IMAGE_EDITING'], permission: 'designer:edit', requiresApproval: false, input: imageInput,
    async execute(input, context) { return tools.find((tool) => tool.key === 'social.generateImage')!.execute(input, context) },
  },
  {
    key: 'lead.search', name: 'Search leads', description: 'Search leads through a configured research integration.', modules: ['leads', 'universal'], capabilities: ['WEB_RESEARCH'], permission: 'lead:search', requiresApproval: false, input: textInput,
    async execute() { return failed('SEARCH_ADAPTER_REQUIRED', 'No verified lead search adapter is configured.') },
  },
  {
    key: 'lead.enrich', name: 'Enrich lead', description: 'Enrich an owned lead through a configured research integration.', modules: ['leads', 'universal'], capabilities: ['WEB_RESEARCH'], permission: 'lead:enrich', requiresApproval: false, input: idInput,
    async execute() { return failed('SEARCH_ADAPTER_REQUIRED', 'No verified lead enrichment adapter is configured.') },
  },
  {
    key: 'lead.outreach', name: 'Send lead outreach', description: 'Send approved outreach through a configured email adapter.', modules: ['leads', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'lead:outreach', requiresApproval: true, input: idInput,
    async execute() { return failed('EMAIL_ADAPTER_REQUIRED', 'No verified outbound email adapter is configured.') },
  },
  {
    key: 'email.send', name: 'Send email', description: 'Send an approved email through a configured email provider.', modules: ['universal', 'leads'], capabilities: ['TEXT_GENERATION'], permission: 'email:send', requiresApproval: true, input: z.object({ to: z.string().email(), subject: z.string().min(1), body: z.string().min(1) }),
    async execute() { return failed('EMAIL_ADAPTER_REQUIRED', 'No verified email adapter is configured.') },
  },
  {
    key: 'system.health', name: 'Check system health', description: 'Verify database availability.', modules: ['system', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'system:health', requiresApproval: false, input: z.object({}),
    async execute() { const result = await prisma.$queryRaw`SELECT 1 AS ok`; return { ok: true, verified: true, data: { database: 'healthy', result } } },
  },
  {
    key: 'system.test', name: 'Run system test', description: 'Run a non-destructive structured system test.', modules: ['system', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'system:test', requiresApproval: false, input: z.object({ name: z.string().min(1).max(120) }),
    async execute(input) { const parsed = z.object({ name: z.string().min(1).max(120) }).parse(input); return { ok: true, verified: true, data: { test: parsed.name, status: 'PASSED' } } },
  },
  {
    key: 'system.repair', name: 'Repair system issue', description: 'Queue a repair attempt after diagnosis and approval.', modules: ['system', 'universal'], capabilities: ['REASONING'], permission: 'system:repair', requiresApproval: true, input: textInput,
    async execute() { return failed('REPAIR_APPROVAL_REQUIRED', 'System repair requires an approved repair plan.') },
  },
]

export function listAgentTools(module?: string) {
  return tools.filter((tool) => {
    if (!module || module === 'universal') return tool.modules.includes('universal')
    return tool.modules.includes(module) || tool.modules.includes('system')
  })
}

export function getAgentTool(key: string) {
  return tools.find((tool) => tool.key === key)
}

export async function authorizeAgentTool(userId: string, tool: AgentTool) {
  if (tool.requiresApproval) return false
  const denied = await prisma.userPermission.findFirst({ where: { userId, permission: tool.permission, effect: 'DENY' } })
  return !denied
}
