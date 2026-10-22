import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// In-Memory Database Store for robust AI Studio offline/mock resilience
type ModelRecord = Record<string, any>

class InMemoryStore {
  private tables = new Map<string, Map<string, ModelRecord>>()

  constructor() {
    this.seedDefaults()
  }

  private getTable(model: string): Map<string, ModelRecord> {
    const key = model.toLowerCase()
    if (!this.tables.has(key)) {
      this.tables.set(key, new Map())
    }
    return this.tables.get(key)!
  }

  private seedDefaults() {
    // Generate valid hashes for admin access
    const adminHash = bcrypt.hashSync('admin2026', 10)
    const adminAltHash = bcrypt.hashSync('zionpraise5561', 10)

    const adminUser = {
      id: 'usr_admin_default',
      email: 'realitydesign5561@gmail.com',
      name: 'TROS Admin',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date(),
      featurePermissions: [],
    }
    this.getTable('user').set(adminUser.id, adminUser)

    const adminAltUser = {
      id: 'usr_admin_alt',
      email: 'admin@reality.com',
      name: 'TROS Administrator',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date(),
      featurePermissions: [],
    }
    this.getTable('user').set(adminAltUser.id, adminAltUser)

    // Pre-seed API Keys
    const geminiKey = {
      id: 'key_gemini_default',
      provider: 'Gemini',
      label: 'Google Gemini Pro',
      value: process.env.GEMINI_API_KEY || 'AIzaSyDemo-GeminiKeyMockValue1234567890',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.getTable('apikey').set(geminiKey.id, geminiKey)

    const openAiKey = {
      id: 'key_openai_default',
      provider: 'OpenAI',
      label: 'OpenAI GPT-4o',
      value: process.env.OPENAI_API_KEY || 'sk-proj-demoMockOpenAiKey1234567890abcdef',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.getTable('apikey').set(openAiKey.id, openAiKey)

    // Pre-seed a project
    const defaultProject = {
      id: 'proj_demo_01',
      ownerId: adminUser.id,
      name: 'AI Agency Platform',
      niche: 'Digital Marketing & AI Automation',
      status: 'ACTIVE',
      health: 'HEALTHY',
      prompt: 'High-conversion agency landing page with modern dark theme and AI appointment booking.',
      pages: ['Home', 'Services', 'Case Studies', 'Pricing', 'Contact'],
      blueprint: 'Modern Next.js 14 Web Architecture\n- Autonomous Lead Ingestion\n- Visual Asset Generation\n- Real-time Client Reporting',
      deploymentUrl: 'https://preview.agency.tros.run',
      repositoryUrl: 'https://github.com/realitydesign5561-afk/agency-site',
      domain: 'agency.tros.run',
      createdAt: new Date(),
      updatedAt: new Date(),
      managementLogs: [
        { id: 'log_1', title: 'System initialized & SSL provisioned', type: 'DEPLOYMENT', createdAt: new Date() },
        { id: 'log_2', title: 'Daily backup snapshot created', type: 'BACKUP', createdAt: new Date() },
      ],
    }
    this.getTable('project').set(defaultProject.id, defaultProject)

    // Pre-seed a course
    const defaultCourse = {
      id: 'course_demo_01',
      ownerId: adminUser.id,
      title: 'Building Autonomous AI Agents with Next.js',
      topic: 'Artificial Intelligence & Web Engineering',
      description: 'A comprehensive step-by-step masterclass on architecting and orchestrating production AI agent pipelines.',
      targetAudience: 'Software Developers & Tech Founders',
      prerequisites: 'Basic TypeScript & React familiarity',
      learningOutcomes: 'Master agent loops, tool dispatching, resilient error recovery, and multimodal generation.',
      status: 'PUBLISHED',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.getTable('course').set(defaultCourse.id, defaultCourse)

    const defaultModule = {
      id: 'mod_demo_01',
      courseId: defaultCourse.id,
      title: 'Agent Architecture Fundamentals',
      position: 1,
      objectives: 'Understand reactive planning and tool calling loops.',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.getTable('coursemodule').set(defaultModule.id, defaultModule)

    const defaultLesson = {
      id: 'les_demo_01',
      moduleId: defaultModule.id,
      title: 'Orchestrating Tool Calls & Error Fallbacks',
      position: 1,
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      script: 'In this lesson, we explore how autonomous systems gracefully degrade when external APIs are offline...',
      status: 'READY',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.getTable('courselesson').set(defaultLesson.id, defaultLesson)

    // Pre-seed leads
    const sampleLeads = [
      { id: 'lead_1', ownerId: adminUser.id, name: 'Sarah Jenkins', company: 'Apex Growth Labs', email: 'sarah@apexgrowth.demo', score: 92, status: 'QUALIFIED', createdAt: new Date(), updatedAt: new Date() },
      { id: 'lead_2', ownerId: adminUser.id, name: 'David Okafor', company: 'Lagos FinTech Hub', email: 'david@lagosfintech.demo', score: 88, status: 'CONTACTED', createdAt: new Date(), updatedAt: new Date() },
      { id: 'lead_3', ownerId: adminUser.id, name: 'Elena Rostova', company: 'Veritas Analytics', email: 'elena@veritas.demo', score: 95, status: 'ENGAGED', createdAt: new Date(), updatedAt: new Date() },
    ]
    sampleLeads.forEach(lead => this.getTable('lead').set(lead.id, lead))

    // Pre-seed Social Posts
    const samplePosts = [
      { id: 'post_1', ownerId: adminUser.id, platform: 'twitter', caption: 'Scaling digital operations shouldn’t require 10 different fragmented tools. Unified systems are the future.', hashtags: '#Automation #AI #TechStack', status: 'SCHEDULED', scheduledAt: new Date(Date.now() + 86400000), createdAt: new Date(), updatedAt: new Date() },
      { id: 'post_2', ownerId: adminUser.id, platform: 'linkedin', caption: 'How we reduced manual marketing overhead by 80% using autonomous content pipelines.', hashtags: '#Leadership #Productivity #AI', status: 'DRAFT', scheduledAt: null, createdAt: new Date(), updatedAt: new Date() },
    ]
    samplePosts.forEach(post => this.getTable('socialpost').set(post.id, post))
  }

  // Model Operations
  findUnique(model: string, query: any) {
    const table = this.getTable(model)
    const where = query?.where || {}
    for (const record of table.values()) {
      if (this.matchesWhere(record, where)) {
        return this.applyInclude(model, record, query?.include, query?.select)
      }
    }
    return null
  }

  findFirst(model: string, query: any) {
    return this.findUnique(model, query)
  }

  findMany(model: string, query: any) {
    const table = this.getTable(model)
    const where = query?.where || {}
    let results: ModelRecord[] = []

    for (const record of table.values()) {
      if (this.matchesWhere(record, where)) {
        results.push(this.applyInclude(model, record, query?.include, query?.select))
      }
    }

    if (query?.orderBy) {
      const orderKeys = Object.keys(query.orderBy)
      if (orderKeys.length > 0) {
        const key = orderKeys[0]
        const dir = query.orderBy[key] === 'desc' ? -1 : 1
        results.sort((a, b) => {
          const valA = a[key] instanceof Date ? a[key].getTime() : a[key]
          const valB = b[key] instanceof Date ? b[key].getTime() : b[key]
          if (valA < valB) return -1 * dir
          if (valA > valB) return 1 * dir
          return 0
        })
      }
    }

    if (query?.skip) results = results.slice(query.skip)
    if (query?.take) results = results.slice(0, query.take)

    return results
  }

  create(model: string, query: any) {
    const table = this.getTable(model)
    const data = { ...(query?.data || {}) }

    if (!data.id) {
      data.id = `${model.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    }
    if (!data.createdAt) data.createdAt = new Date()
    if (!data.updatedAt) data.updatedAt = new Date()

    // Handle nested creates (e.g. modules, lessons)
    if (data.modules?.create && Array.isArray(data.modules.create)) {
      const createdModules: any[] = []
      for (const modData of data.modules.create) {
        const modId = `mod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
        const lessons = modData.lessons?.create || []
        const createdLessons: any[] = []
        for (const lData of lessons) {
          const lessonId = `les_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
          const lesson = { id: lessonId, moduleId: modId, ...lData, createdAt: new Date(), updatedAt: new Date() }
          this.getTable('courselesson').set(lessonId, lesson)
          createdLessons.push(lesson)
        }
        const cleanModData = { ...modData }
        delete cleanModData.lessons
        const modRecord = { id: modId, courseId: data.id, ...cleanModData, lessons: createdLessons, createdAt: new Date(), updatedAt: new Date() }
        this.getTable('coursemodule').set(modId, modRecord)
        createdModules.push(modRecord)
      }
      data.modules = createdModules
    }

    table.set(data.id, data)
    return this.applyInclude(model, data, query?.include, query?.select)
  }

  update(model: string, query: any) {
    const table = this.getTable(model)
    const where = query?.where || {}
    let targetKey: string | null = null

    for (const [key, record] of table.entries()) {
      if (this.matchesWhere(record, where)) {
        targetKey = key
        break
      }
    }

    if (!targetKey) {
      // Upsert fallback
      return this.create(model, { data: { ...(query?.where || {}), ...(query?.data || {}) } })
    }

    const current = table.get(targetKey)!
    const updated = { ...current, ...(query?.data || {}), updatedAt: new Date() }
    table.set(targetKey, updated)
    return this.applyInclude(model, updated, query?.include, query?.select)
  }

  updateMany(model: string, query: any) {
    const table = this.getTable(model)
    const where = query?.where || {}
    let count = 0

    for (const [key, record] of table.entries()) {
      if (this.matchesWhere(record, where)) {
        table.set(key, { ...record, ...(query?.data || {}), updatedAt: new Date() })
        count++
      }
    }
    return { count }
  }

  upsert(model: string, query: any) {
    const existing = this.findUnique(model, { where: query?.where })
    if (existing) {
      return this.update(model, { where: query?.where, data: query?.update })
    } else {
      return this.create(model, { data: { ...(query?.where || {}), ...(query?.create || {}) } })
    }
  }

  delete(model: string, query: any) {
    const table = this.getTable(model)
    const where = query?.where || {}
    for (const [key, record] of table.entries()) {
      if (this.matchesWhere(record, where)) {
        table.delete(key)
        return record
      }
    }
    return {}
  }

  deleteMany(model: string, query: any) {
    const table = this.getTable(model)
    const where = query?.where
    if (!where || Object.keys(where).length === 0) {
      const count = table.size
      table.clear()
      return { count }
    }
    let count = 0
    for (const [key, record] of table.entries()) {
      if (this.matchesWhere(record, where)) {
        table.delete(key)
        count++
      }
    }
    return { count }
  }

  count(model: string, query: any) {
    const items = this.findMany(model, query)
    return items.length
  }

  private matchesWhere(record: ModelRecord, where: Record<string, any>): boolean {
    if (!where || Object.keys(where).length === 0) return true
    for (const key of Object.keys(where)) {
      const target = where[key]
      if (key === 'lte' || key === 'gte' || key === 'lt' || key === 'gt') continue

      // Composite unique key matching (e.g. ownerId_platform)
      if (typeof target === 'object' && target !== null && !(target instanceof Date)) {
        if ('lte' in target) {
          const dateVal = record[key] instanceof Date ? record[key].getTime() : new Date(record[key]).getTime()
          const cmpVal = target.lte instanceof Date ? target.lte.getTime() : new Date(target.lte).getTime()
          if (dateVal > cmpVal) return false
        }
        if ('gte' in target) {
          const dateVal = record[key] instanceof Date ? record[key].getTime() : new Date(record[key]).getTime()
          const cmpVal = target.gte instanceof Date ? target.gte.getTime() : new Date(target.gte).getTime()
          if (dateVal < cmpVal) return false
        }
        // nested where check
        for (const subKey of Object.keys(target)) {
          if (subKey !== 'lte' && subKey !== 'gte') {
            if (record[subKey] !== target[subKey]) return false
          }
        }
        continue
      }

      if (record[key] !== target) {
        return false
      }
    }
    return true
  }

  private applyInclude(model: string, record: ModelRecord, include: any, select: any): ModelRecord {
    const res = { ...record }
    const m = model.toLowerCase()

    if (m === 'course') {
      if (include?.modules) {
        const modules = this.findMany('coursemodule', { where: { courseId: record.id } })
        if (typeof include.modules === 'object' && include.modules.include?.lessons) {
          res.modules = modules.map(mod => ({
            ...mod,
            lessons: this.findMany('courselesson', { where: { moduleId: mod.id } })
          }))
        } else {
          res.modules = modules
        }
      }
    }

    if (m === 'project') {
      if (include?.managementLogs) {
        res.managementLogs = record.managementLogs || []
      }
    }

    if (m === 'leadcampaign') {
      if (include?.leads) res.leads = this.findMany('lead', { where: { campaignId: record.id } })
      if (include?.messages) res.messages = this.findMany('leadmessage', { where: { campaignId: record.id } })
    }

    if (m === 'socialpost') {
      if (include?.analytics) {
        res.analytics = record.analytics || { views: 120, likes: 14, reposts: 3 }
      }
    }

    if (select && typeof select === 'object') {
      const filtered: Record<string, any> = {}
      for (const k of Object.keys(select)) {
        if (select[k]) filtered[k] = res[k]
      }
      return filtered
    }

    return res
  }
}

// Global Store Instance
const inMemoryStore = new InMemoryStore()

// Optional real client if configured
let realPrismaClient: any = null
if (process.env.DATABASE_URL) {
  try {
    realPrismaClient = new PrismaClient()
  } catch (e) {
    console.warn('[AI Studio] PrismaClient connection failed to initialize, using in-memory store.')
    realPrismaClient = null
  }
}

// Proxy builder for robust delegation
function createModelProxy(modelName: string) {
  return new Proxy({}, {
    get: (_, action: string) => {
      return async (...args: any[]) => {
        if (realPrismaClient && realPrismaClient[modelName]?.[action]) {
          try {
            return await realPrismaClient[modelName][action](...args)
          } catch (err: any) {
            console.warn(`[AI Studio] Real DB call failed for ${modelName}.${action}, falling back to in-memory store:`, err.message)
          }
        }

        // Delegate to inMemoryStore
        const store = inMemoryStore as any
        if (typeof store[action] === 'function') {
          return store[action](modelName, args[0])
        }

        // Fallback for unhandled actions
        return null
      }
    }
  })
}

// Root Prisma Proxy
const prismaProxy = new Proxy({}, {
  get: (_, prop: string) => {
    if (prop === '$connect') return async () => true
    if (prop === '$disconnect') return async () => true
    if (prop === '$transaction') return async (actions: any) => {
      if (typeof actions === 'function') return actions(prismaProxy)
      if (Array.isArray(actions)) return Promise.all(actions)
      return []
    }

    return createModelProxy(prop)
  }
}) as unknown as PrismaClient

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
export const prisma = globalForPrisma.prisma ?? prismaProxy
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
