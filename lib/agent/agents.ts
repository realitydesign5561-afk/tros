import { prisma } from '@/lib/prisma'
import { listAgentTools } from './registry'

export const builtInAgents = [
  { key: 'universal', name: 'TROS Universal Agent', module: 'universal', systemInstructions: 'You are the TROS orchestration agent. Never claim a side effect completed unless a tool returns verified=true. Ask for missing information, expose a plan before execution, and use only discoverable tools.', capabilities: ['planning', 'execution', 'validation', 'repair'] },
  { key: 'website', name: 'Website Agent', module: 'website-factory', systemInstructions: 'Create and modify persisted website projects. Deployment requires explicit approval and a verified deployment adapter.', capabilities: ['WEBSITE_GENERATION'] },
  { key: 'workflow', name: 'Workflow Agent', module: 'workflows', systemInstructions: 'Create and update workflow definitions. Never report an external workflow run as complete without a verified provider result.', capabilities: ['TEXT_GENERATION'] },
  { key: 'social', name: 'Social Agent', module: 'social', systemInstructions: 'Generate content and assets, but require approval before scheduling or publishing.', capabilities: ['TEXT_GENERATION', 'IMAGE_GENERATION'] },
  { key: 'course', name: 'Course Agent', module: 'courses', systemInstructions: 'Create persisted course content and validate generated lesson output before saving.', capabilities: ['TEXT_GENERATION', 'REASONING'] },
  { key: 'youtube', name: 'YouTube Agent', module: 'youtube', systemInstructions: 'Research and generate video assets. Publishing requires explicit approval and a verified adapter.', capabilities: ['WEB_RESEARCH', 'TEXT_GENERATION', 'IMAGE_GENERATION'] },
  { key: 'designer', name: 'Designer Agent', module: 'designer', systemInstructions: 'Generate or edit design assets only through configured image providers and persist verified artifact metadata.', capabilities: ['IMAGE_GENERATION', 'IMAGE_EDITING'] },
  { key: 'leads', name: 'Lead Agent', module: 'leads', systemInstructions: 'Keep lead data owned and isolated. Outreach requires approval and a verified email adapter.', capabilities: ['WEB_RESEARCH', 'TEXT_GENERATION'] },
]

export async function ensureAgentRegistry() {
  for (const agent of builtInAgents) {
    await prisma.agent.upsert({ where: { key: agent.key }, create: agent, update: { name: agent.name, module: agent.module, systemInstructions: agent.systemInstructions, capabilities: agent.capabilities } })
  }
}

export function agentForModule(module: string) {
  return builtInAgents.find((agent) => agent.module === module) || builtInAgents[0]
}

export function discoverTools(module: string) {
  return listAgentTools(module).map((tool) => ({ key: tool.key, name: tool.name, description: tool.description, capabilities: tool.capabilities, permission: tool.permission, requiresApproval: tool.requiresApproval }))
}
