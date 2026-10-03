export interface VideoAsset {
  provider: string;
  externalId: string;
  url: string;
  status: 'PENDING' | 'READY' | 'FAILED';
}

export abstract class VideoProvider {
  abstract providerName: string;

  /**
   * Request video generation or upload
   */
  abstract createVideo(script: string, visualPrompt?: string): Promise<string>;

  /**
   * Check status of the generated video
   */
  abstract checkStatus(externalId: string): Promise<VideoAsset>;
}

export class VideoAdapterManager {
  private providers: VideoProvider[] = [];

  register(provider: VideoProvider) {
    this.providers.push(provider);
  }

  async generateWithFallback(script: string, visualPrompt?: string): Promise<VideoAsset> {
    for (const provider of this.providers) {
      try {
        const externalId = await provider.createVideo(script, visualPrompt);
        const asset = await provider.checkStatus(externalId);
        
        if (asset.status === 'READY') {
          return asset;
        }
      } catch (error) {
        console.error(`Provider ${provider.providerName} failed, trying next...`, error);
        continue;
      }
    }
    
    throw new Error('All video providers failed to generate valid asset.');
  }
}
