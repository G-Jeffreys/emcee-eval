/**
 * Lyrics Generation Package
 * 
 * This package provides OpenAI-powered lyrics generation and enhancement capabilities.
 */

// Export types
export type {
  Genre,
  OpenAIConfig,
  ChatCompletionOptions,
  VerseGenerationOptions,
} from './types.js';

export { GENRES } from './types.js';

// Export client
export {
  OpenAILyricsClient,
  createOpenAIClient,
  createOpenAIClientFromEnv,
  validateOpenAIConfig,
} from './client.js';

// Export config utilities
export {
  getOpenAIApiKey,
  getOpenAIModel,
  getOpenAIMaxTokens,
  getOpenAITemperature,
  validateOpenAIEnvironment,
} from './config.js';

// Export rhyming functionality
export { makeItRhyme } from './rhyme.js';

// Export song enhancement functionality
export {
  detectChorus,
  generateChorus,
  replaceChorus,
  addVerse,
  generateVersesFromDescription,
} from './song-enhancement.js';
