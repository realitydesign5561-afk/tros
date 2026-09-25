import { prisma } from '@/lib/prisma'

export type WebsiteAdapterResult = { ok: boolean; verified: boolean; data?: Record<string, unknown>; error?: string }

function required(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name}_REQUIRED`)
  return value
}

export async function publishToGitHub(buildId: string, repository?: string): Promise<WebsiteAdapterResult> {
  const token = required('GITHUB_TOKEN')
  const owner = required('GITHUB_OWNER')
  const build = await prisma.websiteBuild.findUnique({ where: { id: buildId }, include: { files: true } })
  if (!build) return { ok: false, verified: false, error: 'BUILD_NOT_FOUND' }
  const repoName = repository || `${process.env.GITHUB_REPOSITORY_PREFIX || 'tros-site'}-${build.projectId.slice(-8)}`
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
  const existing = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers })
  if (existing.status === 404) {
    const created = await fetch('https://api.github.com/user/repos', { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: repoName, private: true, auto_init: true }) })
    if (!created.ok) return { ok: false, verified: false, error: `GITHUB_REPOSITORY_CREATE_FAILED_${created.status}` }
  } else if (!existing.ok) return { ok: false, verified: false, error: `GITHUB_REPOSITORY_LOOKUP_FAILED_${existing.status}` }
  for (const file of build.files) {
    const url = `https://api.github.com/repos/${owner}/${repoName}/contents/${file.path}`
    const current = await fetch(url, { headers })
    const currentData = current.ok ? await current.json() as { sha?: string } : {}
    const response = await fetch(url, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: `TROS build ${build.id}: ${file.path}`, content: Buffer.from(file.content).toString('base64'), branch: 'main', ...(currentData.sha ? { sha: currentData.sha } : {}) }) })
    if (!response.ok) return { ok: false, verified: false, error: `GITHUB_FILE_PUSH_FAILED_${response.status}` }
  }
  const repositoryUrl = `https://github.com/${owner}/${repoName}`
  await prisma.project.update({ where: { id: build.projectId }, data: { repositoryUrl } })
  return { ok: true, verified: true, data: { owner, repository: repoName, repositoryUrl, branch: 'main' } }
}

export async function deployToVercel(buildId: string, repositoryUrl?: string): Promise<WebsiteAdapterResult> {
  const token = required('VERCEL_TOKEN')
  const build = await prisma.websiteBuild.findUnique({ where: { id: buildId }, include: { files: true, project: true } })
  if (!build) return { ok: false, verified: false, error: 'BUILD_NOT_FOUND' }
  const files = build.files.filter((file) => file.kind !== 'PREVIEW').map((file) => ({ file: file.path, data: file.content }))
  const payload: Record<string, unknown> = { name: build.project.name.toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 48), files, target: 'production' }
  if (process.env.VERCEL_PROJECT_ID) payload.project = process.env.VERCEL_PROJECT_ID
  if (process.env.VERCEL_TEAM_ID) payload.teamId = process.env.VERCEL_TEAM_ID
  if (repositoryUrl) payload.meta = { githubRepository: repositoryUrl }
  const response = await fetch('https://api.vercel.com/v13/deployments', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  const data = await response.json().catch(() => ({})) as { id?: string; url?: string; error?: { message?: string } }
  if (!response.ok || !data.url) return { ok: false, verified: false, error: data.error?.message || `VERCEL_DEPLOYMENT_FAILED_${response.status}` }
  const url = data.url.startsWith('http') ? data.url : `https://${data.url}`
  const health = await fetch(url, { redirect: 'follow' }).catch(() => null)
  const verified = Boolean(health?.ok)
  await prisma.deploymentSnapshot.create({ data: { projectId: build.projectId, status: verified ? 'HEALTHY' : 'FAILED', url, checkedAt: new Date() } })
  if (verified) await prisma.project.update({ where: { id: build.projectId }, data: { deploymentUrl: url, status: 'DEPLOYED', health: 'HEALTHY' } })
  return verified ? { ok: true, verified: true, data: { url, deploymentId: data.id } } : { ok: false, verified: false, error: 'DEPLOYMENT_HEALTH_CHECK_FAILED' }
}
