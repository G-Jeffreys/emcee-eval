/**
 * Shared types for lyrics generation
 */

/**
 * Music genre options for AI generation
 */
export type Genre = 'rock' | 'rap' | 'country';

/**
 * Available genre options as a constant array
 */
export const GENRES: Genre[] = ['rock', 'rap', 'country'] as const;

/**
 * OpenAI client configuration
 */
export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Options for chat completion requests
 */
export interface ChatCompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Verse generation options
 */
export interface VerseGenerationOptions {
  verseCount?: number;
  linesPerVerse?: string; // e.g. "4-8"
  includeContext?: boolean;
}
