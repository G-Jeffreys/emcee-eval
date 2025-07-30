/**
 * Shared TypeScript types for the AI Rap Battle application
 * 
 * These types are used across the frontend, backend, and other packages
 * to ensure consistency in data structures.
 */

/**
 * Word-level timing data for karaoke synchronization
 */
export interface Word {
  start: number;
  end: number;
  text: string;
}

/**
 * Line-level timing data with word-level breakdown
 */
export interface Line {
  start: number;
  end: number;
  text: string;
  words: Word[];
}

/**
 * Lyric section (verse, chorus, bridge, etc.) with line and word timing
 */
export interface LyricsSection {
  section_type: string;
  start: number;
  end: number;
  lines?: Line[];
}

/**
 * A single verse in a rap battle with audio and timing data
 */
export interface Verse {
  url: string;
  ai: string;
  duration: number;
  lyrics_sections: LyricsSection[];
}

/**
 * AI Battler types - the allowed AI models for rap battles
 */
export type AIBattler = 'grok' | 'openai' | 'gemini' | 'anthropic';

/**
 * Battle status enum
 */
export type BattleStatus = 'pending' | 'generating' | 'completed' | 'failed';

/**
 * Complete battle information with verses
 */
export interface Battle {
  battle_id: string;
  ai_one: string;
  ai_two: string;
  status: BattleStatus;
  current_round?: number;
  total_rounds?: number;
  verses: Verse[];
  rounds?: Verse[]; // Deprecated, use verses instead
  winner?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Battle creation request
 */
export interface CreateBattleRequest {
  ai_one: string;
  ai_two: string;
  total_rounds?: number;
}

/**
 * Battle creation response
 */
export interface CreateBattleResponse {
  battle_id: string;
  status: BattleStatus;
  ai_one: string;
  ai_two: string;
  current_round: number;
  total_rounds: number;
}

/**
 * Utility functions for AI Battler validation
 */

/**
 * List of valid AI battlers
 */
export const AI_BATTLERS: readonly AIBattler[] = ['grok', 'openai', 'gemini', 'anthropic'] as const;

/**
 * Check if a string is a valid AI battler
 */
export function isValidAIBattler(ai: string): ai is AIBattler {
  return AI_BATTLERS.includes(ai as AIBattler);
}

/**
 * Normalize AI name to valid battler, with warning for invalid names
 * @param ai - The AI name to normalize
 * @param context - Optional context for the warning message
 * @returns Valid AI battler, defaults to 'openai' if invalid
 */
export function normalizeAIBattler(ai: string, context?: string): AIBattler {
  const normalized = ai.toLowerCase().trim();
  
  if (isValidAIBattler(normalized)) {
    return normalized;
  }
  
  console.warn(
    `⚠️ Invalid AI battler name: "${ai}"${context ? ` (${context})` : ''}. ` +
    `Valid options are: ${AI_BATTLERS.join(', ')}. Defaulting to 'openai'.`
  );
  
  return 'openai';
}
