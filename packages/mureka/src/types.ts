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
    duration?: number;
  }>;
}

/**
 * Mureka API configuration interface
 */
export interface MurekaConfig {
  apiKey: string;
  baseUrl?: string;
}
