export async function providerHealth(id: string) {
  return { status: 'HEALTHY', latency: 100 };
}
export async function executeAITask(params: any) {
  if (params.capability === 'TEXT_GENERATION') {
    return { output: '{"title": "Mock Course", "description": "Mock description", "modules": [{"title": "Module 1", "lessons": ["Lesson 1", "Lesson 2"]}]}', providerName: 'mock', taskId: 'mock' };
  }
  return { output: { url: '/mock-design.png' }, providerName: 'mock', taskId: 'mock' };
}
export async function testAIProvider(id: string) { return { status: 'mock' }; }
