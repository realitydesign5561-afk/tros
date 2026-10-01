export function shouldReuseWebsiteStage(status: string, output: unknown): boolean {
  return status === 'COMPLETED' && output !== null && output !== undefined
}