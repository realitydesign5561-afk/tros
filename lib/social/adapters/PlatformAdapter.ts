export interface SocialPostParams {
  content: string;
  mediaUrls?: string[];
}

export abstract class PlatformAdapter {
  abstract platformName: string;

  /**
   * Initialize or refresh connection
   */
  abstract connect(authCode: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }>;

  /**
   * Publish a post to the platform
   */
  abstract publishPost(accessToken: string, post: SocialPostParams): Promise<{ externalPostId: string }>;

  /**
   * Fetch analytics for a specific post
   */
  abstract getAnalytics(accessToken: string, externalPostId: string): Promise<any>;
}
