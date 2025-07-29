/**
 * Mureka AI Package
 * 
 * This package provides a client for interacting with the Mureka AI API for song generation.
 */

// Export types
export type {
  Genre,
  SongGenerationRequest,
  SongGenerationResponse,
  MurekaConfig,
} from './types.js';

export { GENRES } from './types.js';

// Export client
export {
  MurekaClient,
  createMurekaClient,
  createMurekaClientFromEnv,
  validateMurekaWebhook,
} from './client.js';

// Export config utilities
export {
  getMurekaApiKey,
  getMurekaBaseUrl,
  validateMurekaEnvironment,
} from './config.js';
