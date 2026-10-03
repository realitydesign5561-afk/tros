import { VideoAdapterManager } from './adapters/VideoProvider';
import { MockVideoProvider } from './adapters/MockVideoProvider';

// Singleton manager instance
export const videoAdapterManager = new VideoAdapterManager();

// Register providers (can be extended later)
videoAdapterManager.register(new MockVideoProvider());

// Export for use elsewhere
export default videoAdapterManager;
