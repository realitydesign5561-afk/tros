import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Resend } from 'resend'
import { executeAITask } from '@/lib/ai-gateway/service'
import { createWorkflow, isActivepiecesConfigured, runWorkflow } from '@/lib/activepieces'
import { createWebsiteBuild, deployWebsiteBuild } from '@/lib/website-factory/pipeline'
import { resolveServerCredential } from '@/lib/ai-gateway/credentials'
import type { AgentTool, AgentToolContext, AgentToolResult } from './types'

const textInput = z.object({ prompt: z.string().min(1).max(20_000), capability: z.string().optional() })
const projectInput = z.object({ name: z.string().min(2).max(120), niche: z.string().max(160).optional(), pages: z.string().max(2_000).optional(), brandColors: z.string().max(500).optional() })
const workflowInput = z.object({ name: z.string().min(2).max(120), graph: z.record(z.string(), z.unknown()).optional() })
const courseInput = z.object({ title: z.string().min(2).max(160), topic: z.string().min(2).max(240), description: z.string().max(2_000).optional() })
const imageInput = z.object({ prompt: z.string().min(1).max(10_000), size: z.string().optional() })
const idInput = z.object({ id: z.string().min(1) })
const courseLessonInput = z.object({ courseId: z.string().min(1), title: z.string().min(2).max(200), prompt: z.string().min(2).max(10_000) })
const exerciseInput = z.object({ lessonId: z.string().min(1), prompt: z.string().min(2).max(10_000) })
const youtubeVideoInput = z.object({ videoId: z.string().min(1) })
const youtubeThumbnailInput = z.object({ videoId: z.string().min(1), prompt: z.string().min(1).max(10_000), size: z.string().optional() })
const socialContentInput = z.object({ prompt: z.string().min(1).max(20_000), platform: z.string().min(1).max(40), hashtags: z.string().max(2_000).optional() })
const scheduledSocialInput = z.object({ platform: z.string().min(1), caption: z.string().min(1).max(10_000), scheduledAt: z.string().datetime(), hashtags: z.string().max(2_000).optional(), imageUrl: z.string().url().optional() })

async function requireResend(ownerId?: string) {
  const apiKey = process.env.RESEND_API_KEY || (await resolveServerCredential(['resend', 'email', 'Email'], ownerId))?.value
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) throw new Error('RESEND_API_KEY and RESEND_FROM_EMAIL must be configured.')
  return { client: new Resend(apiKey), from }
}

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
      const prompt = `Build ${parsed.name}, a ${parsed.niche || 'business'} website. Pages: ${parsed.pages || 'Home, About, Contact'}. Brand colors: ${parsed.brandColors || 'choose a cohesive accessible palette'}.`
      const { project, build } = await createWebsiteBuild({ ownerId: context.userId, projectName: parsed.name, prompt, niche: parsed.niche, pages: parsed.pages, brandColors: parsed.brandColors })
      return { ok: true, verified: true, data: { projectId: project.id, buildId: build.id, status: build.status } }
    },
  },
  {
    key: 'website.modify', name: 'Modify website project', description: 'Queue an improvement build for an existing owned website project.', modules: ['website-factory', 'universal'], capabilities: ['WEBSITE_GENERATION'], permission: 'website:modify', requiresApproval: false, input: idInput.extend({ instruction: z.string().min(3).max(10_000), pages: z.string().optional(), brandColors: z.string().optional() }),
    async execute(input, context) {
      const parsed = idInput.extend({ instruction: z.string().min(3).max(10_000), pages: z.string().optional(), brandColors: z.string().optional() }).parse(input)
      const project = await prisma.project.findFirst({ where: { id: parsed.id, ownerId: context.userId } })
      if (!project) return failed('PROJECT_NOT_FOUND', 'Owned project was not found.')
      const { build } = await createWebsiteBuild({ ownerId: context.userId, existingProjectId: project.id, projectName: project.name, prompt: `${project.prompt || `Build ${project.name}.`}\nRequested change: ${parsed.instruction}`, pages: parsed.pages, brandColors: parsed.brandColors })
      return { ok: true, verified: true, data: { projectId: project.id, buildId: build.id, status: build.status } }
    },
  },
  {
    key: 'website.deploy', name: 'Deploy website', description: 'Deploy a verified owned Website Factory build.', modules: ['website-factory', 'universal'], capabilities: ['WEBSITE_GENERATION'], permission: 'website:deploy', requiresApproval: true, input: z.object({ buildId: z.string().min(1), pushGitHub: z.boolean().optional() }),
    async execute(input, context) {
      const parsed = z.object({ buildId: z.string().min(1), pushGitHub: z.boolean().optional() }).parse(input)
      const build = await prisma.websiteBuild.findFirst({ where: { id: parsed.buildId, ownerId: context.userId } })
      if (!build) return failed('BUILD_NOT_FOUND', 'Owned website build was not found.')
      const result = await deployWebsiteBuild(build.id, parsed.pushGitHub)
      return result.status === 'DEPLOYED' ? { ok: true, verified: true, data: result } : failed('DEPLOYMENT_FAILED', result.error || 'Deployment health verification failed.', true)
    },
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
    key: 'workflow.run', name: 'Run workflow', description: 'Dispatch an activated owned workflow to the configured Activepieces instance.', modules: ['workflows', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'workflow:run', requiresApproval: true, input: idInput,
    async execute(input, context) {
      const parsed = idInput.parse(input)
      const workflow = await prisma.workflow.findFirst({ where: { id: parsed.id, ownerId: context.userId } })
      if (!workflow) return failed('WORKFLOW_NOT_FOUND', 'Owned workflow was not found.')
      if (!workflow.activepiecesId || !(await isActivepiecesConfigured(context.userId))) return failed('ACTIVEPIECES_NOT_CONFIGURED', 'Connect Activepieces and activate this workflow before running it.')
      const run = await prisma.workflowRun.create({ data: { workflowId: workflow.id, status: 'RUNNING', logs: 'Dispatching through Universal Agent.' } })
      try {
        const result = await runWorkflow(workflow.activepiecesId, context.userId)
        await prisma.workflowRun.update({ where: { id: run.id }, data: { status: 'RUNNING', externalId: result.id, logs: 'Dispatched to Activepieces; awaiting provider completion.' } })
        return { ok: true, verified: Boolean(result.id), data: { runId: run.id, externalId: result.id, status: result.status || 'RUNNING' } }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Activepieces workflow dispatch failed.'
        await prisma.workflowRun.update({ where: { id: run.id }, data: { status: 'FAILED', logs: message, finishedAt: new Date() } })
        return failed('ACTIVEPIECES_RUN_FAILED', message, true)
      }
    },
  },
  {
    key: 'social.generateContent', name: 'Generate social content', description: 'Generate and persist a social draft through the AI Gateway.', modules: ['social', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'social:generate', requiresApproval: false, input: socialContentInput,
    async execute(input, context) {
      const parsed = socialContentInput.parse(input)
      const generated = await executeAITask({ task: parsed.prompt, capability: 'TEXT_GENERATION', userId: context.userId, projectId: context.projectId })
      if (typeof generated.output !== 'string' || !generated.output.trim()) return failed('INVALID_PROVIDER_OUTPUT', 'The AI provider returned no social content.')
      const post = await prisma.socialPost.create({ data: { ownerId: context.userId, platform: parsed.platform, caption: generated.output, hashtags: parsed.hashtags || '', status: 'DRAFT', analytics: { create: {} } } })
      return { ok: true, verified: true, data: { postId: post.id, status: post.status, taskId: generated.taskId } }
    },
  },
  {
    key: 'social.research', name: 'Research social topic', description: 'Research a social topic through a configured research-capable provider.', modules: ['social', 'universal'], capabilities: ['WEB_RESEARCH'], permission: 'social:research', requiresApproval: false, input: textInput,
    async execute() { return failed('SEARCH_ADAPTER_REQUIRED', 'No verified web search provider is configured; a text model alone cannot verify current facts.') },
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
    key: 'social.schedule', name: 'Schedule social post', description: 'Persist an approved scheduled post for the configured social publishing worker.', modules: ['social', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'social:schedule', requiresApproval: true, input: scheduledSocialInput,
    async execute(input, context) {
      const parsed = scheduledSocialInput.parse(input)
      const scheduledAt = new Date(parsed.scheduledAt)
      if (scheduledAt <= new Date()) return failed('SCHEDULE_TIME_INVALID', 'Scheduled post time must be in the future.')
      const post = await prisma.socialPost.create({ data: { ownerId: context.userId, platform: parsed.platform, caption: parsed.caption, hashtags: parsed.hashtags || '', imageUrl: parsed.imageUrl || null, scheduledAt, status: 'SCHEDULED', analytics: { create: {} } } })
      return { ok: true, verified: true, data: { postId: post.id, status: post.status, scheduledAt: post.scheduledAt } }
    },
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
    key: 'course.generateLesson', name: 'Generate lesson', description: 'Generate and persist a lesson in an owned course through the AI Gateway.', modules: ['courses', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'course:generate', requiresApproval: false, input: courseLessonInput,
    async execute(input, context) {
      const parsed = courseLessonInput.parse(input)
      const course = await prisma.course.findFirst({ where: { id: parsed.courseId, ownerId: context.userId } })
      if (!course) return failed('COURSE_NOT_FOUND', 'Owned course was not found.')
      const generated = await executeAITask({ task: `${parsed.prompt}\nWrite the lesson titled "${parsed.title}" with clear sections and practical examples.`, capability: 'TEXT_GENERATION', userId: context.userId, projectId: context.projectId })
      if (typeof generated.output !== 'string' || !generated.output.trim()) return failed('INVALID_PROVIDER_OUTPUT', 'The AI provider returned no lesson content.')
      let courseModule = await prisma.courseModule.findFirst({ where: { courseId: course.id }, orderBy: { position: 'asc' } })
      if (!courseModule) courseModule = await prisma.courseModule.create({ data: { courseId: course.id, title: 'Course lessons', position: 0 } })
      const position = await prisma.lesson.count({ where: { moduleId: courseModule.id } })
      const lesson = await prisma.lesson.create({ data: { moduleId: courseModule.id, title: parsed.title, position, script: generated.output, status: 'READY' } })
      return { ok: true, verified: true, data: { courseId: course.id, lessonId: lesson.id, title: lesson.title, taskId: generated.taskId } }
    },
  },
  {
    key: 'course.generateExercise', name: 'Generate and save lesson exercise', description: 'Generate and persist an exercise for a lesson in an owned course.', modules: ['courses', 'universal'], capabilities: ['REASONING'], permission: 'course:generate', requiresApproval: false, input: exerciseInput,
    async execute(input, context) {
      const parsed = exerciseInput.parse(input)
      const lesson = await prisma.lesson.findFirst({ where: { id: parsed.lessonId, module: { course: { ownerId: context.userId } } }, include: { module: true } })
      if (!lesson) return failed('LESSON_NOT_FOUND', 'Owned lesson was not found.')
      const generated = await executeAITask({ task: `${parsed.prompt}\nCreate a learner exercise for lesson "${lesson.title}". Return concise instructions and success criteria.`, capability: 'REASONING', userId: context.userId, projectId: context.projectId })
      if (typeof generated.output !== 'string' || !generated.output.trim()) return failed('INVALID_PROVIDER_OUTPUT', 'The AI provider returned no exercise content.')
      const assignment = await prisma.assignment.upsert({ where: { lessonId: lesson.id }, create: { lessonId: lesson.id, prompt: generated.output }, update: { prompt: generated.output } })
      return { ok: true, verified: true, data: { lessonId: lesson.id, assignmentId: assignment.id, prompt: assignment.prompt, taskId: generated.taskId } }
    },
  },
  {
    key: 'youtube.research', name: 'Research YouTube topic', description: 'Generate and persist research for an owned YouTube video through the AI Gateway.', modules: ['youtube', 'universal'], capabilities: ['WEB_RESEARCH'], permission: 'youtube:research', requiresApproval: false, input: youtubeVideoInput,
    async execute(input, context) {
      const parsed = youtubeVideoInput.parse(input)
      const video = await prisma.youTubeVideo.findFirst({ where: { id: parsed.videoId, ownerId: context.userId } })
      if (!video) return failed('VIDEO_NOT_FOUND', 'Owned YouTube video was not found.')
      return failed('SEARCH_ADAPTER_REQUIRED', `No verified web search provider is configured to research "${video.topic}".`)
    },
  },
  {
    key: 'youtube.generateScript', name: 'Generate YouTube script', description: 'Generate and persist a script for an owned YouTube video.', modules: ['youtube', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'youtube:generate', requiresApproval: false, input: youtubeVideoInput,
    async execute(input, context) {
      const parsed = youtubeVideoInput.parse(input)
      const video = await prisma.youTubeVideo.findFirst({ where: { id: parsed.videoId, ownerId: context.userId } })
      if (!video) return failed('VIDEO_NOT_FOUND', 'Owned YouTube video was not found.')
      const generated = await executeAITask({ task: `Write a YouTube script for topic "${video.topic}". Include a strong hook, clear sections, factual caution, and a concise call to action.`, capability: 'TEXT_GENERATION', userId: context.userId, projectId: context.projectId })
      if (typeof generated.output !== 'string' || !generated.output.trim()) return failed('INVALID_PROVIDER_OUTPUT', 'The AI provider returned no script.')
      const updated = await prisma.youTubeVideo.update({ where: { id: video.id }, data: { script: generated.output, stage: 'VOICEOVER' } })
      return { ok: true, verified: true, data: { videoId: updated.id, script: updated.script, taskId: generated.taskId } }
    },
  },
  {
    key: 'youtube.generateThumbnail', name: 'Generate YouTube thumbnail', description: 'Generate and persist a thumbnail asset for an owned YouTube video.', modules: ['youtube', 'universal'], capabilities: ['IMAGE_GENERATION'], permission: 'youtube:image', requiresApproval: false, input: youtubeThumbnailInput,
    async execute(input, context) {
      const parsed = youtubeThumbnailInput.parse(input)
      const video = await prisma.youTubeVideo.findFirst({ where: { id: parsed.videoId, ownerId: context.userId } })
      if (!video) return failed('VIDEO_NOT_FOUND', 'Owned YouTube video was not found.')
      const generated = await executeAITask({ task: parsed.prompt, capability: 'IMAGE_GENERATION', imageSize: parsed.size, userId: context.userId, projectId: context.projectId, fallbackPolicy: { maxAttempts: 1 } })
      if (typeof generated.output !== 'object' || !generated.output.url) return failed('INVALID_PROVIDER_OUTPUT', 'The image provider returned no thumbnail URL.')
      const asset = await prisma.youTubeAsset.create({ data: { videoId: video.id, type: 'THUMBNAIL', status: 'READY', provider: generated.model, url: generated.output.url, externalId: generated.taskId } })
      return { ok: true, verified: true, data: { videoId: video.id, assetId: asset.id, url: asset.url } }
    },
  },
  {
    key: 'youtube.publish', name: 'Publish YouTube video', description: 'Publish through a configured YouTube adapter after approval.', modules: ['youtube', 'universal'], capabilities: ['VIDEO_GENERATION'], permission: 'youtube:publish', requiresApproval: true, input: idInput,
    async execute() { return failed('YOUTUBE_ADAPTER_REQUIRED', 'No verified YouTube publishing adapter is configured.') },
  },
  {
    key: 'designer.generate', name: 'Generate design', description: 'Generate and persist a design artifact through a configured image provider.', modules: ['designer', 'universal'], capabilities: ['IMAGE_GENERATION'], permission: 'designer:generate', requiresApproval: false, input: imageInput,
    async execute(input, context) {
      const parsed = imageInput.parse(input)
      const generated = await executeAITask({ task: parsed.prompt, capability: 'IMAGE_GENERATION', imageSize: parsed.size, userId: context.userId, projectId: context.projectId, fallbackPolicy: { maxAttempts: 1 } })
      if (typeof generated.output !== 'object' || !generated.output.url) return failed('INVALID_PROVIDER_OUTPUT', 'The image provider returned no design URL.')
      const design = await prisma.design.create({ data: { ownerId: context.userId, prompt: parsed.prompt, outputUrl: generated.output.url, provider: generated.model, status: 'READY' } })
      return { ok: true, verified: true, data: { designId: design.id, outputUrl: design.outputUrl, taskId: generated.taskId } }
    },
  },
  {
    key: 'designer.edit', name: 'Edit design', description: 'Edit an owned design through a configured image provider.', modules: ['designer', 'universal'], capabilities: ['IMAGE_EDITING'], permission: 'designer:edit', requiresApproval: false, input: imageInput,
    async execute() { return failed('IMAGE_EDITING_ADAPTER_REQUIRED', 'Configured image generation cannot edit an uploaded source image. An image-editing provider adapter is required.') },
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
    key: 'lead.outreach', name: 'Send lead outreach', description: 'Send approved outreach to an owned lead using the configured Resend account.', modules: ['leads', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'lead:outreach', requiresApproval: true, input: idInput,
    async execute(input, context) {
      const parsed = idInput.parse(input)
      const lead = await prisma.lead.findFirst({ where: { id: parsed.id, ownerId: context.userId } })
      if (!lead) return failed('LEAD_NOT_FOUND', 'Owned lead was not found.')
      if (!lead.email) return failed('LEAD_EMAIL_MISSING', 'The lead has no email address.')
      let client: Resend
      let from: string
      try { ({ client, from } = await requireResend(context.userId)) } catch (error) { return failed('EMAIL_ADAPTER_REQUIRED', error instanceof Error ? error.message : 'Resend is not configured.') }
      const subject = `A quick idea for ${lead.company || lead.name}`
      const body = `Hi ${lead.name},\n\nI noticed ${lead.company || 'your team'} may be working through ${lead.painPoints || 'a growth bottleneck'}. I put together a short idea that could help.\n\nWould it be useful to compare notes?`
      const message = await prisma.leadMessage.create({ data: { leadId: lead.id, campaignId: lead.campaignId, channel: 'EMAIL', subject, body, status: 'SENDING' } })
      const result = await client.emails.send({ from, to: [lead.email], subject, text: body }, { idempotencyKey: `agent-lead-outreach/${context.taskId}/${lead.id}` })
      if (result.error || !result.data?.id) {
        const reason = result.error?.message || 'Email provider did not confirm a message ID.'
        await prisma.leadMessage.update({ where: { id: message.id }, data: { status: 'FAILED' } })
        return failed('EMAIL_SEND_FAILED', reason, true)
      }
      const sent = await prisma.leadMessage.update({ where: { id: message.id }, data: { status: 'SENT', sentAt: new Date(), providerId: result.data.id } })
      return { ok: true, verified: true, data: { leadId: lead.id, messageId: sent.id, providerId: result.data.id, status: sent.status } }
    },
  },
  {
    key: 'email.send', name: 'Send email', description: 'Send an approved email through a configured email provider.', modules: ['universal', 'leads'], capabilities: ['TEXT_GENERATION'], permission: 'email:send', requiresApproval: true, input: z.object({ to: z.string().email(), subject: z.string().min(1), body: z.string().min(1) }),
    async execute(input, context) {
      const parsed = z.object({ to: z.string().email(), subject: z.string().min(1), body: z.string().min(1) }).parse(input)
      let client: Resend
      let from: string
      try { ({ client, from } = await requireResend(context.userId)) } catch (error) { return failed('EMAIL_ADAPTER_REQUIRED', error instanceof Error ? error.message : 'Resend is not configured.') }
      const result = await client.emails.send({ from, to: [parsed.to], subject: parsed.subject, text: parsed.body }, { idempotencyKey: `agent-email/${context.taskId}` })
      if (result.error || !result.data?.id) return failed('EMAIL_SEND_FAILED', result.error?.message || 'Email provider did not confirm a message ID.', true)
      await prisma.systemEvent.create({ data: { actorId: context.userId, event: 'agent_email_sent', resourceType: 'email', resourceId: result.data.id, data: { taskId: context.taskId, recipientDomain: parsed.to.split('@')[1] } } })
      return { ok: true, verified: true, data: { providerId: result.data.id, status: 'SENT' } }
    },
  },
  {
    key: 'system.health', name: 'Check system health', description: 'Verify database availability.', modules: ['system', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'system:health', requiresApproval: false, input: z.object({}),
    async execute() { const result = await prisma.$queryRaw`SELECT 1 AS ok`; return { ok: true, verified: true, data: { database: 'healthy', result } } },
  },
  {
    key: 'system.test', name: 'Run system test', description: 'Run a non-destructive structured system test.', modules: ['system', 'universal'], capabilities: ['TEXT_GENERATION'], permission: 'system:test', requiresApproval: false, input: z.object({ name: z.string().min(1).max(120) }),
    async execute(input) {
      const parsed = z.object({ name: z.string().min(1).max(120) }).parse(input)
      const database = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`
      if (Number(database[0]?.ok) !== 1) return failed('SYSTEM_TEST_FAILED', 'Database connectivity probe returned an unexpected result.', true)
      return { ok: true, verified: true, data: { test: parsed.name, checks: [{ name: 'database-connectivity', status: 'PASSED' }] } }
    },
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
