/**
 * Shared types for Mureka API
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
 * Song generation request interface
 */
export interface SongGenerationRequest {
  lyrics: string;
  genre?: Genre;
  model?: 'auto' | 'mureka-5.5' | 'mureka-6';
  prompt?: string;
  reference_id?: string;
  vocal_id?: string;
  melody_id?: string;
}

/**
 * Word-level timing data
 */
export interface WordTiming {
  start: number;
  end: number;
  text: string;
}

/**
 * Line-level timing data with word-level breakdown
 */
export interface LineTiming {
  start: number;
  end: number;
  text: string;
  words: WordTiming[];
}

/**
 * Lyric section (verse, chorus, bridge, etc.) with line and word timing
 */
export interface LyricsSection {
  section_type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro';
  start: number;
  end: number;
  lines?: LineTiming[];
}

/**
 * Song generation response interface
 */
export interface SongGenerationResponse {
  id: string;
  created_at: number;
  finished_at?: number;
  model: string;
  status: 'preparing' | 'queued' | 'running' | 'succeeded' | 'failed' | 'timeouted' | 'cancelled';
  failed_reason?: string;
  choices?: Array<{
    url?: string;
    flac_url?: string;
    duration?: number;
    lyrics_sections?: LyricsSection[];
  }>;
}

/**
 * Mureka API configuration interface
 */
export interface MurekaConfig {
  apiKey: string;
  baseUrl?: string;
}
