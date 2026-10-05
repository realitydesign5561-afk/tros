import { prisma } from '@/lib/prisma'
import { getProviderClient } from '@/lib/aiGateway'

// Create a new project and initial deployment snapshot (build)
export async function createWebsiteBuild(data: any) {
  const project = await prisma.project.create({
    data: {
      ownerId: data.ownerId,
      name: data.projectName || 'AI Website',
      prompt: data.prompt,
      niche: data.niche,
      pages: data.pages,
      brandColors: data.brandColors,
      generateSystem: data.generateSystem || false,
      hasLogin: data.hasLogin || false,
      status: 'BUILDING',
      source: 'GENERATED'
    }
  })

  const build = await prisma.deploymentSnapshot.create({
    data: {
      projectId: project.id,
      status: 'QUEUED',
      url: `/preview/${project.id}`
    }
  })

  // Trigger the worker in the background (fire and forget)
  fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/website-factory/worker`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WEBSITE_WORKER_SECRET || process.env.AGENT_WORKER_SECRET || process.env.CRON_SECRET || ''}`
    }
  }).catch(console.error)

  return { project, build: { ...build, stage: 'QUEUED', progress: 0 } }
}

export async function claimWebsiteBuild() {
  const build = await prisma.deploymentSnapshot.findFirst({
    where: { status: 'QUEUED' },
    orderBy: { checkedAt: 'asc' },
    include: { project: true }
  })
  
  if (!build) return null
  
  await prisma.deploymentSnapshot.update({
    where: { id: build.id },
    data: { status: 'GENERATING' }
  })
  
  return build
}

export async function runWebsiteBuild(buildId: string, asyncRun = false) {
  const build = await prisma.deploymentSnapshot.findUnique({
    where: { id: buildId },
    include: { project: true }
  })

  if (!build || !build.project) return { success: false, error: 'Build not found' }

  try {
    // We try to find a configured provider, defaulting to openai or gemini
    const apiKeyRecord = await prisma.apiKey.findFirst({ where: { provider: { in: ['OpenAI', 'Gemini'] } } })
    
    if (!apiKeyRecord) {
      throw new Error('CONFIGURATION_REQUIRED: No AI provider configured for Website Factory.')
    }

    const client = getProviderClient({ name: apiKeyRecord.provider, apiKey: apiKeyRecord.value })

    const prompt = `You are an expert web developer. Build a modern responsive landing page for:
Name: ${build.project.name}
Niche: ${build.project.niche || 'Business'}
Colors: ${build.project.brandColors || 'Black, White, Gold'}
Pages/Sections: ${build.project.pages || 'Hero, Properties, About, Testimonials, Contact, Footer'}
Original Prompt: ${build.project.prompt || ''}

Return ONLY valid HTML containing embedded CSS (Tailwind via CDN) and Javascript. It must be a complete <html> document. Do NOT include markdown blocks (\`\`\`).
Include a fully functional contact form that shows an alert on submit. Ensure the layout is mobile responsive.`

    const response = await client.generate({
      model: apiKeyRecord.provider === 'OpenAI' ? 'gpt-4o' : 'gemini-1.5-pro',
      messages: [{ role: 'user', content: prompt }]
    })

    let code = response.choices?.[0]?.message?.content || ''
    // Strip markdown formatting if the model leaked it
    code = code.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/```$/g, '').trim()

    // Save the generated code into the project's blueprint field
    await prisma.project.update({
      where: { id: build.project.id },
      data: {
        blueprint: code,
        status: 'ACTIVE',
        deploymentUrl: `/api/website-factory/preview/${build.project.id}`
      }
    })

    await prisma.deploymentSnapshot.update({
      where: { id: build.id },
      data: {
        status: 'COMPLETED',
        url: `/api/website-factory/preview/${build.project.id}`
      }
    })

    // Log analytics
    await prisma.analyticsEvent.create({
      data: {
        name: 'website_factory_success',
        source: apiKeyRecord.provider,
        metadata: JSON.stringify({ projectId: build.project.id })
      }
    })

    return { success: true, url: `/api/website-factory/preview/${build.project.id}` }
  } catch (err: any) {
    await prisma.deploymentSnapshot.update({
      where: { id: build.id },
      data: { status: 'FAILED' }
    })
    
    await prisma.project.update({
      where: { id: build.project.id },
      data: { status: 'ERROR', health: err.message }
    })
    
    return { success: false, error: err.message }
  }
}

// Stubs for other required exports
export async function triggerWebsiteBuild(id: string) { return runWebsiteBuild(id) }
export async function generateWebsite(params: any) { return { id: 'mock-website', status: 'COMPLETED' } }
export async function deployWebsiteBuild(id: string) { return { success: true } }
export async function repairWebsiteBuild(id: string) { return runWebsiteBuild(id) }
