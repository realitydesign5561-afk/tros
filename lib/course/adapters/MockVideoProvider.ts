import { VideoProvider, VideoAsset } from '../VideoProvider';

export class MockVideoProvider extends VideoProvider {
  providerName = 'MockProvider';

  async createVideo(script: string, visualPrompt?: string): Promise<string> {
    // Simulate async video generation and return a mock external ID
    const externalId = `mock-${Date.now()}`;
    // In a real provider you would start an async job here.
    return externalId;
  }

  async checkStatus(externalId: string): Promise<VideoAsset> {
    // Mock a ready video after a short delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      provider: this.providerName,
      externalId,
      url: `https://example.com/videos/${externalId}.mp4`,
      status: 'READY',
    };
  }
}
