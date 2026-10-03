export async function controlAgentTask(id: string, userId: string, action: string) {
  return { id, status: action };
}

export async function createAgentTask(data: any) {
  return { id: 'mock-task', status: 'PENDING' };
}

export async function submitAgentTaskWorker(data: any) {
  return { success: true };
}
export async function claimNextAgentTask(region?: string) { return null; }
export async function runAgentTask(id: string, lockedBy?: string, async?: boolean) { return null; }
