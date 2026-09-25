import crypto from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { executeAITask } from '@/lib/ai-gateway/service'
import { deployToVercel, publishToGitHub } from './adapters'

export const WEBSITE_STAGES = ['PROMPT', 'REQUIREMENTS', 'SITE_PLAN', 'BRAND_SYSTEM', 'PAGE_PLAN', 'COMPONENT_PLAN', 'CODE', 'DATABASE', 'API', 'TEST', 'PREVIEW', 'REPAIR', 'DEPLOY'] as const
export type WebsiteStage = typeof WEBSITE_STAGES[number]

const requirementsSchema = z.object({ audience: z.string(), goals: z.array(z.string()), pages: z.array(z.string()), features: z.array(z.string()), forms: z.array(z.string()), integrations: z.array(z.string()), constraints: z.array(z.string()) })
const filesSchema = z.object({ files: z.array(z.object({ path: z.string().min(1), kind: z.string().default('SOURCE'), content: z.string() })).min(1), previewHtml: z.string().min(100) })

function jsonOutput(output: unknown) {
  if (typeof output !== 'string') return output
  return JSON.parse(output.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''))
}

async function log(buildId: string, stage: string, message: string, level = 'INFO', data?: unknown) {
  const latest = await prisma.websiteBuildLog.aggregate({ where: { buildId }, _max: { sequence: true } })
  return prisma.websiteBuildLog.create({ data: { buildId, sequence: (latest._max.sequence || 0) + 1, stage, level, message, data: data as any } })
}

async function stage(buildId: string, sequence: number, name: string, status: string, input?: unknown, output?: unknown, error?: string) {
  return prisma.websiteBuildStep.upsert({ where: { buildId_sequence: { buildId, sequence } }, create: { buildId, sequence, stage: name, status, input: input as any, output: output as any, error }, update: { status, input: input as any, output: output as any, error, ...(status === 'RUNNING' ? { startedAt: new Date() } : { completedAt: new Date() }) } })
}

async function aiStage(build: { id: string; ownerId: string; projectId: string; prompt: string }, stageName: WebsiteStage, instruction: string, maxTokens = 1400) {
  await log(build.id, stageName, `${stageName.replaceAll('_', ' ')} started.`)
  const result = await executeAITask({ task: instruction, capability: 'WEBSITE_GENERATION', userId: build.ownerId, projectId: build.projectId, maxTokens })
  const output = jsonOutput(result.output)
  await log(build.id, stageName, `${stageName.replaceAll('_', ' ')} completed.`, 'INFO', { taskId: result.taskId, provider: result.providerName, model: result.model })
  return output
}

function checksum(content: string) {
  return crypto.createHash('sha256').update(content).digest('hex')
}

export async function createWebsiteBuild(input: { ownerId: string; projectName: string; prompt: string; niche?: string; pages?: string; brandColors?: string; hasLogin?: boolean; generateSystem?: boolean }) {
  const project = await prisma.project.create({ data: { ownerId: input.ownerId, name: input.projectName, niche: input.niche || null, pages: input.pages || null, brandColors: input.brandColors || null, prompt: input.prompt, hasLogin: Boolean(input.hasLogin), generateSystem: Boolean(input.generateSystem), source: 'AI_AGENT', status: 'BUILDING', health: 'QUEUED' } })
  const build = await prisma.websiteBuild.create({ data: { ownerId: input.ownerId, projectId: project.id, prompt: input.prompt } })
  await log(build.id, 'PROMPT', 'Website request queued.', 'INFO', { projectId: project.id })
  return { project, build }
}

export async function claimWebsiteBuild(workerId = `website-${crypto.randomUUID()}`) {
  const build = await prisma.websiteBuild.findFirst({ where: { status: 'QUEUED', availableAt: { lte: new Date() }, lockedAt: null }, orderBy: { createdAt: 'asc' } })
  if (!build) return null
  const claimed = await prisma.websiteBuild.updateMany({ where: { id: build.id, status: 'QUEUED', availableAt: { lte: new Date() }, lockedAt: null }, data: { lockedAt: new Date(), lockedBy: workerId, attempts: { increment: 1 } } })
  return claimed.count ? prisma.websiteBuild.findUnique({ where: { id: build.id } }) : null
}

export async function runWebsiteBuild(buildId: string, alreadyClaimed = false) {
  const buildRecord = await prisma.websiteBuild.findUnique({ where: { id: buildId }, include: { project: true } })
  if (!buildRecord) return { status: 'NOT_FOUND' as const }
  if (!alreadyClaimed) {
    const claimed = await prisma.websiteBuild.updateMany({ where: { id: buildId, status: 'QUEUED', availableAt: { lte: new Date() }, lockedAt: null }, data: { lockedAt: new Date(), lockedBy: `website-${crypto.randomUUID()}`, attempts: { increment: 1 } } })
    if (!claimed.count) return { status: 'NOT_CLAIMED' as const }
  }
  const build = { id: buildRecord.id, ownerId: buildRecord.ownerId, projectId: buildRecord.projectId, prompt: buildRecord.prompt }
  const base = `${build.prompt}\nProject: ${buildRecord.project.name}\nNiche: ${buildRecord.project.niche || ''}\nRequested pages: ${buildRecord.project.pages || ''}\nBrand colors: ${buildRecord.project.brandColors || ''}`
  const sequence = new Map<WebsiteStage, number>(WEBSITE_STAGES.map((item, index) => [item, index + 1]))
  try {
    await prisma.websiteBuild.update({ where: { id: build.id }, data: { status: 'RUNNING', stage: 'REQUIREMENTS', progress: 5, startedAt: new Date(), currentStep: 'Extracting requirements' } })
    const requirements = requirementsSchema.parse(await aiStage(build, 'REQUIREMENTS', `Extract exact website requirements from this request. Return JSON only with audience, goals, pages, features, forms, integrations, constraints. Do not invent integrations not requested.\n${base}`))
    await stage(build.id, sequence.get('REQUIREMENTS')!, 'REQUIREMENTS', 'COMPLETED', { prompt: base }, requirements)
    await prisma.websiteBuild.update({ where: { id: build.id }, data: { requirements, progress: 12, stage: 'SITE_PLAN', currentStep: 'Creating site plan' } })

    const sitePlan = await aiStage(build, 'SITE_PLAN', `Create a production site plan from these requirements. Return JSON with sitemap, navigation, content model, user journeys, SEO strategy, and acceptance criteria.\n${JSON.stringify(requirements)}`)
    await stage(build.id, sequence.get('SITE_PLAN')!, 'SITE_PLAN', 'COMPLETED', requirements, sitePlan)
    await prisma.websiteBuild.update({ where: { id: build.id }, data: { sitePlan, progress: 20, stage: 'BRAND_SYSTEM', currentStep: 'Defining brand system' } })

    const brandSystem = await aiStage(build, 'BRAND_SYSTEM', `Create an original responsive brand system for this website. Return JSON with color tokens, typography, spacing, component style, imagery direction, accessibility rules, and reference-inspiration rules. Never copy a reference website.\nBrand request: ${base}\nSite plan: ${JSON.stringify(sitePlan)}`)
    await stage(build.id, sequence.get('BRAND_SYSTEM')!, 'BRAND_SYSTEM', 'COMPLETED', sitePlan, brandSystem)
    await prisma.websiteBuild.update({ where: { id: build.id }, data: { brandSystem, progress: 28, stage: 'PAGE_PLAN', currentStep: 'Planning pages' } })

    const pagePlan = await aiStage(build, 'PAGE_PLAN', `Create a page-by-page implementation plan. Return JSON with pages, each containing route, purpose, sections, data needs, form actions, SEO metadata, and responsive behavior.\nRequirements: ${JSON.stringify(requirements)}\nBrand: ${JSON.stringify(brandSystem)}`)
    await stage(build.id, sequence.get('PAGE_PLAN')!, 'PAGE_PLAN', 'COMPLETED', requirements, pagePlan)
    await prisma.websiteBuild.update({ where: { id: build.id }, data: { pagePlan, progress: 36, stage: 'COMPONENT_PLAN', currentStep: 'Planning components' } })

    const componentPlan = await aiStage(build, 'COMPONENT_PLAN', `Create a reusable component and layout plan for this website. Return JSON with layouts, components, props, states, validation rules, and API dependencies.\nPage plan: ${JSON.stringify(pagePlan)}\nBrand: ${JSON.stringify(brandSystem)}`)
    await stage(build.id, sequence.get('COMPONENT_PLAN')!, 'COMPONENT_PLAN', 'COMPLETED', pagePlan, componentPlan)
    await prisma.websiteBuild.update({ where: { id: build.id }, data: { componentPlan, progress: 44, stage: 'CODE', currentStep: 'Generating source code' } })

    const code = filesSchema.parse(await aiStage(build, 'CODE', `Generate an original working Next.js website implementation. Return JSON only with files (path, kind, content) and previewHtml. Include app/page.tsx, app/layout.tsx, app/globals.css, responsive routes/components, semantic SEO metadata, accessible forms with real API action placeholders, and no secrets. previewHtml must be a self-contained visual preview of the requested website. Do not copy any existing website.\nRequirements: ${JSON.stringify(requirements)}\nSite plan: ${JSON.stringify(sitePlan)}\nBrand: ${JSON.stringify(brandSystem)}\nPages: ${JSON.stringify(pagePlan)}\nComponents: ${JSON.stringify(componentPlan)}`, 6000))
    await prisma.websiteFile.deleteMany({ where: { buildId: build.id } })
    await prisma.websiteFile.createMany({ data: [...code.files, { path: 'preview.html', kind: 'PREVIEW', content: code.previewHtml }].map((file) => ({ buildId: build.id, path: file.path, kind: file.kind, content: file.content, checksum: checksum(file.content), verified: false })) })
    await stage(build.id, sequence.get('CODE')!, 'CODE', 'COMPLETED', componentPlan, { files: code.files.map((file) => file.path), preview: 'preview.html' })
    await prisma.websiteBuild.update({ where: { id: build.id }, data: { progress: 58, stage: 'DATABASE', currentStep: 'Designing data model' } })

    const databasePlan = await aiStage(build, 'DATABASE', `Design the required database schema for the website. Return JSON with models, fields, indexes, migrationNotes, and seedRequirements. If no database is required, return an empty models array.\nRequirements: ${JSON.stringify(requirements)}`)
    await stage(build.id, sequence.get('DATABASE')!, 'DATABASE', 'COMPLETED', requirements, databasePlan)
    await prisma.websiteBuild.update({ where: { id: build.id }, data: { databasePlan, progress: 66, stage: 'API', currentStep: 'Designing API contracts' } })

    const apiPlan = await aiStage(build, 'API', `Design API contracts for the forms, data, authentication, email, payments, or CMS explicitly required by this website. Return JSON with endpoints, methods, auth, inputSchema, outputSchema, and sideEffects. Do not claim an external integration is connected.\nRequirements: ${JSON.stringify(requirements)}\nDatabase: ${JSON.stringify(databasePlan)}`)
    await stage(build.id, sequence.get('API')!, 'API', 'COMPLETED', databasePlan, apiPlan)
    await prisma.websiteBuild.update({ where: { id: build.id }, data: { apiPlan, progress: 74, stage: 'TEST', currentStep: 'Running build validation' } })

    const files = await prisma.websiteFile.findMany({ where: { buildId: build.id } })
    const requiredPaths = ['app/page.tsx', 'app/layout.tsx', 'app/globals.css', 'preview.html']
    const missingPaths = requiredPaths.filter((path) => !files.some((file) => file.path === path))
    const fatalSecret = files.some((file) => /sk-[A-Za-z0-9]{20,}|BEGIN PRIVATE KEY|NEON_DATABASE_URL\s*=/.test(file.content))
    const testReport = { passed: missingPaths.length === 0 && !fatalSecret, checks: { requiredPaths: missingPaths.length === 0, noEmbeddedSecrets: !fatalSecret, fileCount: files.length, previewHtml: Boolean(files.find((file) => file.path === 'preview.html')?.content.includes('<html')) }, missingPaths, fatalSecret }
    await stage(build.id, sequence.get('TEST')!, 'TEST', testReport.passed ? 'COMPLETED' : 'FAILED', { files: files.map((file) => file.path) }, testReport)
    if (!testReport.passed) throw new Error(`BUILD_VALIDATION_FAILED: ${missingPaths.join(', ') || 'Generated files contain a secret-like value.'}`)
    await prisma.websiteBuild.update({ where: { id: build.id }, data: { testReport, progress: 86, stage: 'PREVIEW', currentStep: 'Preparing preview' } })

    await stage(build.id, sequence.get('PREVIEW')!, 'PREVIEW', 'COMPLETED', { file: 'preview.html' }, { ready: true })
    await prisma.websiteFile.updateMany({ where: { buildId: build.id }, data: { verified: true } })
    const version = await prisma.projectVersion.create({ data: { projectId: build.projectId, buildId: build.id, version: (await prisma.projectVersion.count({ where: { projectId: build.projectId } })) + 1, status: 'PREVIEW', source: 'WEBSITE_FACTORY', manifest: { files: files.map((file) => file.path), requirements, sitePlan, brandSystem, pagePlan, componentPlan, databasePlan, apiPlan } } })
    await prisma.projectSnapshot.create({ data: { projectId: build.projectId, versionId: version.id, reason: 'website-build', manifest: { buildId: build.id, versionId: version.id, files: files.map((file) => file.path) } } })
    await prisma.project.update({ where: { id: build.projectId }, data: { blueprint: JSON.stringify({ requirements, sitePlan, brandSystem, pagePlan, componentPlan, databasePlan, apiPlan }), status: 'PREVIEW_READY', health: 'PREVIEW_READY' } })
    await prisma.websiteBuild.update({ where: { id: build.id }, data: { status: 'COMPLETED', stage: 'PREVIEW', progress: 100, currentStep: 'Preview ready', completedAt: new Date(), previewUrl: `/api/website-factory/build/${build.id}/preview`, lockedAt: null, lockedBy: null } })
    await log(build.id, 'PREVIEW', 'Build verified and preview is ready.')
    return { status: 'COMPLETED' as const, buildId: build.id, versionId: version.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Website build failed.'
    await prisma.websiteBuild.update({ where: { id: build.id }, data: { status: 'FAILED', stage: 'REPAIR', error: message, currentStep: 'Repair required', lockedAt: null, lockedBy: null } })
    await log(build.id, 'REPAIR', message, 'ERROR')
    return { status: 'FAILED' as const, buildId: build.id, error: message }
  }
}

export async function repairWebsiteBuild(buildId: string, instruction?: string) {
  const build = await prisma.websiteBuild.findUnique({ where: { id: buildId } })
  if (!build) throw new Error('BUILD_NOT_FOUND')
  await prisma.websiteBuild.update({ where: { id: buildId }, data: { status: 'QUEUED', stage: 'REPAIR', error: null, prompt: `${build.prompt}\nTargeted repair instruction: ${instruction || 'Inspect the failed build validation and repair only the affected files.'}`, availableAt: new Date(), lockedAt: null, lockedBy: null } })
  return prisma.websiteBuild.findUnique({ where: { id: buildId } })
}

export async function deployWebsiteBuild(buildId: string, pushGitHub = false) {
  const build = await prisma.websiteBuild.findUnique({ where: { id: buildId }, include: { project: true } })
  if (!build) throw new Error('BUILD_NOT_FOUND')
  if (build.status !== 'COMPLETED') throw new Error('BUILD_MUST_PASS_BEFORE_DEPLOY')
  await prisma.websiteBuild.update({ where: { id: buildId }, data: { stage: 'DEPLOY', status: 'DEPLOYING', currentStep: 'Deploying verified build', progress: 96 } })
  await log(buildId, 'DEPLOY', 'Deployment started.')
  try {
    const github = pushGitHub ? await publishToGitHub(buildId, build.project.repositoryUrl?.split('/').pop()) : null
    if (github && !github.ok) throw new Error(github.error || 'GitHub publish failed.')
    const result = await deployToVercel(buildId, github?.data?.repositoryUrl as string | undefined || build.project.repositoryUrl || undefined)
    if (!result.ok || !result.verified) throw new Error(result.error || 'Deployment verification failed.')
    await prisma.websiteBuild.update({ where: { id: buildId }, data: { status: 'DEPLOYED', progress: 100, currentStep: 'Deployment healthy', deploymentUrl: String(result.data?.url), deploymentId: String(result.data?.deploymentId || '') } })
    await log(buildId, 'DEPLOY', 'Deployment health check passed.', 'INFO', result.data)
    return { status: 'DEPLOYED' as const, ...result.data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Deployment failed.'
    await prisma.websiteBuild.update({ where: { id: buildId }, data: { status: 'FAILED', stage: 'DEPLOY', error: message, currentStep: 'Deployment failed' } })
    await log(buildId, 'DEPLOY', message, 'ERROR')
    return { status: 'FAILED' as const, error: message }
  }
}
