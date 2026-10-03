export async function triggerWebsiteBuild(id: string) {
  return { success: true };
}
export async function generateWebsite(params: any) {
  return { id: 'mock-website', status: 'COMPLETED' };
}
export async function createWebsiteBuild(data: any) { return { id: 'mock-build' }; }
export async function deployWebsiteBuild(id: string) { return { success: true }; }
export async function claimWebsiteBuild() { return { buildId: 'mock-build' }; }
export async function runWebsiteBuild(id: string) { return { success: true }; }
export async function repairWebsiteBuild(id: string) { return { success: true }; }
