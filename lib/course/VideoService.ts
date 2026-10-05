import { VideoAdapterManager } from './VideoProvider'
import { GeminiOmniFlashProvider } from './adapters/GeminiOmniFlashProvider'

// Singleton manager instance
export const videoAdapterManager = new VideoAdapterManager()

// Register providers (can be extended later)
videoAdapterManager.register(new GeminiOmniFlashProvider())

// Export for use elsewhere
export default videoAdapterManager
