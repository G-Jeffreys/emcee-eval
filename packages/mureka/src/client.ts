/**
 * @file Mureka AI client for song generation.
 * Handles API communication with the Mureka platform for generating music from lyrics.
 */

import type { Genre, SongGenerationRequest, SongGenerationResponse, MurekaConfig } from './types.js';
import { getMurekaApiKey, getMurekaBaseUrl } from './config.js';

/**
 * Default Mureka API configuration
 */
const DEFAULT_CONFIG = {
  baseUrl: getMurekaBaseUrl(),
} as const;

/**
 * Generate genre-specific prompt for Mureka AI
 */
function generateGenrePrompt(genre: Genre): string {
  const prompts = {
    rap: 'hip-hop, rap, urban, strong beat, rhythmic, modern, male vocal',
    rock: 'rock, alternative, electric guitar, powerful drums, energetic, anthemic, male vocal',
    country: 'country, acoustic guitar, storytelling, heartfelt, melodic, warm, male vocal'
  };
  
  return prompts[genre];
}

/**
 * Mureka AI Client class
 */
export class MurekaClient {
  private config: Required<MurekaConfig>;

  constructor(config: MurekaConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    if (!this.config.apiKey) {
      throw new Error('Mureka API key is required');
    }
  }

  /**
   * Generate a song using the Mureka AI API
   */
  async generateSong(request: SongGenerationRequest): Promise<SongGenerationResponse> {
    try {
      // Use genre to generate appropriate prompt if no custom prompt provided
      const genre = request.genre || 'rap';
      const prompt = request.prompt || generateGenrePrompt(genre);
      
      console.log('🎵 Mureka - Generating song:', {
        genre,
        prompt,
        lyricsLength: request.lyrics.length,
        model: request.model || 'auto'
      });

      const response = await fetch(`${this.config.baseUrl}/v1/song/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lyrics: request.lyrics,
          model: request.model || 'auto',
          prompt: prompt,
          reference_id: request.reference_id,
          vocal_id: request.vocal_id,
          melody_id: request.melody_id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mureka API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      console.log('✅ Mureka - Song generation started:', {
        taskId: data.id,
        status: data.status,
        genre
      });
      
      return data as SongGenerationResponse;
    } catch (error) {
      console.error('❌ Mureka - Error generating song:', error);
      throw error;
    }
  }

  /**
   * Get the status of a song generation task
   */
  async getSongStatus(taskId: string): Promise<SongGenerationResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/song/query/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mureka API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data as SongGenerationResponse;
    } catch (error) {
      console.error('❌ Mureka - Error getting song status:', error);
      throw error;
    }
  }

  /**
   * Poll for song completion with configurable timeout and interval
   */
  async pollSongCompletion(
    taskId: string, 
    options: {
      maxWaitTime?: number;
      pollInterval?: number;
      onProgress?: (status: SongGenerationResponse) => void;
    } = {}
  ): Promise<SongGenerationResponse> {
    const { 
      maxWaitTime = 300000, // 5 minutes default
      pollInterval = 5000,  // 5 seconds default
      onProgress 
    } = options;

    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getSongStatus(taskId);
      
      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'succeeded') {
        console.log('✅ Mureka - Song generation completed:', {
          taskId,
          duration: Date.now() - startTime,
          status: status.status
        });
        return status;
      }

      if (status.status === 'failed' || status.status === 'timeouted' || status.status === 'cancelled') {
        throw new Error(`Song generation failed with status: ${status.status}. Reason: ${status.failed_reason || 'Unknown'}`);
      }

      // Still processing, wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Song generation timed out after ${maxWaitTime}ms`);
  }
}

/**
 * Validate a webhook request from Mureka (basic implementation)
 */
export function validateMurekaWebhook(signature: string, body: string): boolean {
  // Note: Implement proper webhook signature validation based on Mureka's documentation
  // For now, we'll return true but this should be properly implemented for security
  console.warn('Mureka webhook validation not implemented - always returning true');
  return true;
}

/**
 * Create a Mureka client instance
 */
export function createMurekaClient(config: MurekaConfig): MurekaClient {
  return new MurekaClient(config);
}

/**
 * Create a Mureka client instance using environment variables
 */
export function createMurekaClientFromEnv(baseUrl?: string): MurekaClient {
  return new MurekaClient({
    apiKey: getMurekaApiKey(),
    baseUrl: baseUrl || getMurekaBaseUrl()
  });
}
