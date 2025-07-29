import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MurekaClient, createMurekaClient, createMurekaClientFromEnv, validateMurekaWebhook } from './client';
import type { SongGenerationRequest, SongGenerationResponse } from './types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('MurekaClient', () => {
  let client: MurekaClient;
  const mockConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.mureka.ai'
  };
  const originalEnv = process.env;

  beforeEach(() => {
    client = new MurekaClient(mockConfig);
    vi.clearAllMocks();
    // Clear console logs
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should create client with provided config', () => {
      expect(client).toBeInstanceOf(MurekaClient);
    });

    it('should throw error if no API key provided', () => {
      expect(() => new MurekaClient({ apiKey: '' })).toThrow('Mureka API key is required');
    });

    it('should use default base URL if not provided', () => {
      const clientWithoutUrl = new MurekaClient({ apiKey: 'test-key' });
      expect(clientWithoutUrl).toBeInstanceOf(MurekaClient);
    });
  });

  describe('generateSong', () => {
    const mockRequest: SongGenerationRequest = {
      lyrics: 'Test lyrics for rap battle',
      genre: 'rap'
    };

    const mockResponse: SongGenerationResponse = {
      id: 'test-task-id',
      created_at: Date.now(),
      model: 'mureka-6',
      status: 'queued'
    };

    it('should successfully generate song', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.generateSong(mockRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.mureka.ai/v1/song/generate',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          },
          body: expect.stringContaining('"lyrics":"Test lyrics for rap battle"')
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should use default genre prompt when no prompt provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await client.generateSong(mockRequest);

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.prompt).toBe('hip-hop, rap, urban, strong beat, rhythmic, modern, male vocal');
    });

    it('should use custom prompt when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const requestWithPrompt = {
        ...mockRequest,
        prompt: 'custom prompt'
      };

      await client.generateSong(requestWithPrompt);

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.prompt).toBe('custom prompt');
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid lyrics'
      });

      await expect(client.generateSong(mockRequest)).rejects.toThrow('Mureka API error: 400 Bad Request - Invalid lyrics');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.generateSong(mockRequest)).rejects.toThrow('Network error');
    });
  });

  describe('getSongStatus', () => {
    const taskId = 'test-task-id';
    const mockStatusResponse: SongGenerationResponse = {
      id: taskId,
      created_at: Date.now(),
      model: 'mureka-6',
      status: 'succeeded',
      choices: [{ url: 'https://example.com/song.mp3', duration: 120 }]
    };

    it('should successfully get song status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatusResponse
      });

      const result = await client.getSongStatus(taskId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.mureka.ai/v1/song/query/${taskId}`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          }
        })
      );

      expect(result).toEqual(mockStatusResponse);
    });

    it('should handle API errors when getting status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Task not found'
      });

      await expect(client.getSongStatus(taskId)).rejects.toThrow('Mureka API error: 404 Not Found - Task not found');
    });
  });

  describe('pollSongCompletion', () => {
    const taskId = 'test-task-id';

    it('should return immediately if song is already completed', async () => {
      const completedResponse: SongGenerationResponse = {
        id: taskId,
        created_at: Date.now(),
        model: 'mureka-6',
        status: 'succeeded',
        choices: [{ url: 'https://example.com/song.mp3' }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => completedResponse
      });

      const result = await client.pollSongCompletion(taskId, { maxWaitTime: 1000, pollInterval: 100 });

      expect(result).toEqual(completedResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should poll until completion', async () => {
      const runningResponse: SongGenerationResponse = {
        id: taskId,
        created_at: Date.now(),
        model: 'mureka-6',
        status: 'running'
      };

      const completedResponse: SongGenerationResponse = {
        ...runningResponse,
        status: 'succeeded',
        choices: [{ url: 'https://example.com/song.mp3' }]
      };

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => runningResponse })
        .mockResolvedValueOnce({ ok: true, json: async () => completedResponse });

      const result = await client.pollSongCompletion(taskId, { maxWaitTime: 1000, pollInterval: 100 });

      expect(result).toEqual(completedResponse);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should call onProgress callback', async () => {
      const onProgress = vi.fn();
      const completedResponse: SongGenerationResponse = {
        id: taskId,
        created_at: Date.now(),
        model: 'mureka-6',
        status: 'succeeded',
        choices: [{ url: 'https://example.com/song.mp3' }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => completedResponse
      });

      await client.pollSongCompletion(taskId, { maxWaitTime: 1000, onProgress });

      expect(onProgress).toHaveBeenCalledWith(completedResponse);
    });

    it('should throw error on failed status', async () => {
      const failedResponse: SongGenerationResponse = {
        id: taskId,
        created_at: Date.now(),
        model: 'mureka-6',
        status: 'failed',
        failed_reason: 'Invalid lyrics format'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => failedResponse
      });

      await expect(client.pollSongCompletion(taskId, { maxWaitTime: 1000 }))
        .rejects.toThrow('Song generation failed with status: failed. Reason: Invalid lyrics format');
    });

    it('should timeout after maxWaitTime', async () => {
      const runningResponse: SongGenerationResponse = {
        id: taskId,
        created_at: Date.now(),
        model: 'mureka-6',
        status: 'running'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => runningResponse
      });

      await expect(client.pollSongCompletion(taskId, { maxWaitTime: 200, pollInterval: 50 }))
        .rejects.toThrow('Song generation timed out after 200ms');
    });
  });
});

describe('createMurekaClient', () => {
  it('should create a MurekaClient instance', () => {
    const client = createMurekaClient({ apiKey: 'test-key' });
    expect(client).toBeInstanceOf(MurekaClient);
  });
});

describe('createMurekaClientFromEnv', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should create a MurekaClient instance from environment variables', () => {
    process.env.MUREKA_API_KEY = 'env-test-key';
    
    const client = createMurekaClientFromEnv();
    expect(client).toBeInstanceOf(MurekaClient);
  });

  it('should use custom base URL when provided', () => {
    process.env.MUREKA_API_KEY = 'env-test-key';
    
    const client = createMurekaClientFromEnv('https://custom.api.com');
    expect(client).toBeInstanceOf(MurekaClient);
  });

  it('should throw error when MUREKA_API_KEY is not set', () => {
    delete process.env.MUREKA_API_KEY;
    
    expect(() => createMurekaClientFromEnv()).toThrow(
      'MUREKA_API_KEY environment variable is not set'
    );
  });
});

describe('validateMurekaWebhook', () => {
  it('should return true (placeholder implementation)', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const result = validateMurekaWebhook('test-signature', 'test-body');
    expect(result).toBe(true);
    expect(console.warn).toHaveBeenCalledWith('Mureka webhook validation not implemented - always returning true');
  });
});
