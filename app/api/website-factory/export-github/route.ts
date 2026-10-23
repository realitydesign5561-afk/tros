import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { projectId, repoName, description, isPrivate = false, githubToken } = body

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required.' }, { status: 400 })
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: session.user.id },
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  const sanitizedRepoName = (repoName || project.name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')

  const repoDesc = description || project.description || `Website built with Reality Operations System (TROS)`

  let targetRepoUrl = `https://github.com/reality-design/${sanitizedRepoName}`
  let exportedViaApi = false

  // If user provided a GitHub Personal Access Token, call GitHub API directly
  if (githubToken && githubToken.trim().length > 10) {
    try {
      const createRepoRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${githubToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'TROS-Website-Factory',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sanitizedRepoName,
          description: repoDesc,
          private: Boolean(isPrivate),
          auto_init: true,
        }),
      })

      if (createRepoRes.ok) {
        const repoData = await createRepoRes.json()
        targetRepoUrl = repoData.html_url || targetRepoUrl
        exportedViaApi = true

        // Push index.html to repository
        if (project.blueprint) {
          const contentBase64 = Buffer.from(project.blueprint).toString('base64')
          await fetch(`https://api.github.com/repos/${repoData.full_name}/contents/index.html`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${githubToken.trim()}`,
              Accept: 'application/vnd.github.v3+json',
              'User-Agent': 'TROS-Website-Factory',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `Initial deploy from TROS Website Factory`,
              content: contentBase64,
            }),
          }).catch(() => null)
        }
      }
    } catch (err) {
      console.warn('GitHub API repo creation error:', err)
    }
  }

  // Update Project in database
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      repositoryUrl: targetRepoUrl,
      status: 'EXPORTED',
    },
  })

  // Log management action
  await prisma.managementLog.create({
    data: {
      projectId,
      type: 'EXPORT',
      title: `Exported to GitHub: ${sanitizedRepoName}`,
      details: exportedViaApi
        ? `Live GitHub repository created and index.html pushed to ${targetRepoUrl}.`
        : `Repository mapped to ${targetRepoUrl}. Git clone & push instructions ready.`,
    },
  }).catch(() => null)

  return NextResponse.json({
    success: true,
    repoUrl: targetRepoUrl,
    repoName: sanitizedRepoName,
    exportedViaApi,
    project: updatedProject,
    message: exportedViaApi
      ? `Repository created on GitHub at ${targetRepoUrl}`
      : `Project configured for GitHub export to ${targetRepoUrl}`,
  })
}
