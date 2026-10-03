export async function triggerWebsiteBuild(id: string) {
  return { success: true };
}
export async function generateWebsite(params: any) {
  return { id: 'mock-website', status: 'COMPLETED' };
}
