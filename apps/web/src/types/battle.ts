// Re-export shared types for backwards compatibility
export type {
  Word,
  Line,
  LyricsSection,
  Verse,
  Battle,
  BattleStatus,
  CreateBattleRequest,
  CreateBattleResponse,
  AIBattler,
} from '@repo/types';

// Re-export utility functions
export {
  AI_BATTLERS,
  isValidAIBattler,
  normalizeAIBattler,
} from '@repo/types';
