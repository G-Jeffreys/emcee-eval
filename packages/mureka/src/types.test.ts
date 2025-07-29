import { describe, it, expect } from 'vitest';
import { GENRES } from './types';
import type { Genre, SongGenerationRequest, SongGenerationResponse, MurekaConfig } from './types';

describe('Types', () => {
  describe('GENRES constant', () => {
    it('should contain all expected genres', () => {
      expect(GENRES).toEqual(['rock', 'rap', 'country']);
    });

    it('should be readonly array', () => {
      expect(GENRES).toHaveLength(3);
      // Verify the type is correctly inferred
      const genre: Genre = GENRES[0];
      expect(genre).toBe('rock');
    });
  });

  describe('SongGenerationRequest type', () => {
    it('should accept minimal request with just lyrics', () => {
      const request: SongGenerationRequest = {
        lyrics: 'Test lyrics'
      };
      
      expect(request.lyrics).toBe('Test lyrics');
    });

    it('should accept full request with all optional fields', () => {
      const request: SongGenerationRequest = {
        lyrics: 'Test lyrics',
        genre: 'rap',
        model: 'mureka-6',
        prompt: 'custom prompt',
        reference_id: 'ref-123',
        vocal_id: 'vocal-456',
        melody_id: 'melody-789'
      };
      
      expect(request).toEqual({
        lyrics: 'Test lyrics',
        genre: 'rap',
        model: 'mureka-6',
        prompt: 'custom prompt',
        reference_id: 'ref-123',
        vocal_id: 'vocal-456',
        melody_id: 'melody-789'
      });
    });
  });

  describe('SongGenerationResponse type', () => {
    it('should accept minimal response', () => {
      const response: SongGenerationResponse = {
        id: 'task-123',
        created_at: 1234567890,
        model: 'mureka-6',
        status: 'queued'
      };
      
      expect(response.id).toBe('task-123');
      expect(response.status).toBe('queued');
    });

    it('should accept full response with all fields', () => {
      const response: SongGenerationResponse = {
        id: 'task-123',
        created_at: 1234567890,
        finished_at: 1234567950,
        model: 'mureka-6',
        status: 'succeeded',
        failed_reason: undefined,
        choices: [
          { url: 'https://example.com/song.mp3', duration: 120 },
          { url: 'https://example.com/song2.mp3', duration: 115 }
        ]
      };
      
      expect(response.choices).toHaveLength(2);
      expect(response.choices![0].url).toBe('https://example.com/song.mp3');
    });

    it('should accept failed response with reason', () => {
      const response: SongGenerationResponse = {
        id: 'task-123',
        created_at: 1234567890,
        model: 'mureka-6',
        status: 'failed',
        failed_reason: 'Invalid lyrics format'
      };
      
      expect(response.status).toBe('failed');
      expect(response.failed_reason).toBe('Invalid lyrics format');
    });
  });

  describe('MurekaConfig type', () => {
    it('should require apiKey', () => {
      const config: MurekaConfig = {
        apiKey: 'test-key'
      };
      
      expect(config.apiKey).toBe('test-key');
    });

    it('should accept optional baseUrl', () => {
      const config: MurekaConfig = {
        apiKey: 'test-key',
        baseUrl: 'https://custom.api.com'
      };
      
      expect(config.baseUrl).toBe('https://custom.api.com');
    });
  });

  describe('Genre type', () => {
    it('should accept valid genre values', () => {
      const rapGenre: Genre = 'rap';
      const rockGenre: Genre = 'rock';
      const countryGenre: Genre = 'country';
      
      expect(rapGenre).toBe('rap');
      expect(rockGenre).toBe('rock');
      expect(countryGenre).toBe('country');
    });
  });
});
