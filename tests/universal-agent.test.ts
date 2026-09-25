import assert from 'node:assert/strict'
import test from 'node:test'
import { discoverTools } from '../lib/agent/agents'
import { getAgentTool, listAgentTools } from '../lib/agent/registry'
import { canTransitionAgent, transitionAgent } from '../lib/agent/state'

const expectedToolKeys = ['website.create', 'website.modify', 'website.deploy', 'workflow.create', 'workflow.update', 'social.research', 'social.generateContent', 'social.generateImage', 'social.schedule', 'course.create', 'course.generateLesson', 'course.generateExercise', 'youtube.research', 'youtube.generateScript', 'youtube.generateThumbnail', 'youtube.publish', 'designer.generate', 'designer.edit', 'lead.search', 'lead.enrich', 'lead.outreach', 'email.send', 'system.health', 'system.repair', 'system.test']

test('universal registry exposes the complete structured tool catalog', () => {
  const keys = listAgentTools('universal').map((tool) => tool.key)
  for (const key of expectedToolKeys) assert.ok(keys.includes(key), `missing ${key}`)
  assert.equal(new Set(keys).size, keys.length)
  assert.equal(getAgentTool('website.create')?.requiresApproval, false)
  assert.equal(getAgentTool('website.deploy')?.requiresApproval, true)
})

test('module discovery only returns tools usable by that module or universal tools', () => {
  const tools = discoverTools('website-factory')
  assert.ok(tools.some((tool) => tool.key === 'website.create'))
  assert.ok(tools.some((tool) => tool.key === 'system.health'))
  assert.equal(tools.some((tool) => tool.key === 'course.create'), false)
  assert.ok(tools.every((tool) => Array.isArray(tool.capabilities) && typeof tool.permission === 'string'))
})

test('agent lifecycle supports pause, input, repair, cancellation, and completion paths', () => {
  assert.equal(transitionAgent('QUEUED', 'PLANNING'), 'PLANNING')
  assert.equal(transitionAgent('RUNNING', 'REPAIRING'), 'REPAIRING')
  assert.equal(transitionAgent('WAITING_FOR_INPUT', 'QUEUED'), 'QUEUED')
  assert.equal(transitionAgent('VALIDATING', 'COMPLETED'), 'COMPLETED')
  assert.equal(canTransitionAgent('COMPLETED', 'RUNNING'), false)
  assert.throws(() => transitionAgent('COMPLETED', 'RUNNING'), /Invalid agent transition/)
})

test('tool schemas reject malformed side-effect inputs before execution', () => {
  const createWebsite = getAgentTool('website.create')!
  assert.equal(createWebsite.input.safeParse({ name: '' }).success, false)
  assert.equal(createWebsite.input.safeParse({ name: 'Lagos Realty', niche: 'real estate' }).success, true)
  const sendEmail = getAgentTool('email.send')!
  assert.equal(sendEmail.input.safeParse({ to: 'not-an-email', subject: 'Hello', body: 'Body' }).success, false)
})
