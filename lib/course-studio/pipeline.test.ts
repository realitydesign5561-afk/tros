import { generateFullCourse } from './pipeline'

describe('Course Studio Pipeline', () => {
  it('should generate a 12-stage curriculum for AI Web Design with lessons, quizzes, and rubrics', async () => {
    const course = await generateFullCourse({
      topic: 'How to Become a Modern Web Designer Using AI',
      prompt: 'Create a complete beginner course on web design using AI',
      userId: 'test-user-id',
    })

    expect(course.title).toContain('Web Designer')
    expect(course.modules.length).toBeGreaterThanOrEqual(6)
    expect(course.learningOutcomes.length).toBeGreaterThan(0)
    expect(course.price).toBeGreaterThan(0)
    expect(course.capstoneProject).toBeDefined()
    expect(course.capstoneProject.rubric.length).toBeGreaterThan(0)

    const firstModule = course.modules[0]
    expect(firstModule.lessons.length).toBeGreaterThan(0)
    expect(firstModule.lessons[0].script).toBeDefined()
    expect(firstModule.lessons[0].quiz).toBeDefined()
    expect(firstModule.lessons[0].quiz?.answer).toBeDefined()
  })
})
