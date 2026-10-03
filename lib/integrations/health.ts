export async function checkIntegrationHealth(id: string) {
  return { status: 'HEALTHY' };
}
export async function checkExternalIntegrations() { return []; }
