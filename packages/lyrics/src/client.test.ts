import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OpenAILyricsClient, createOpenAIClient, createOpenAIClientFromEnv, validateOpenAIConfig } from './client';
import type { OpenAIConfig } from './types';

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn()
        }
      }
    }))
  };
});

describe('OpenAILyricsClient', () => {
  let client: OpenAILyricsClient;
  let mockOpenAI: any;
  const originalEnv = process.env;
  
  const mockConfig: OpenAIConfig = {
    apiKey: 'sk-test1234567890',
    model: 'gpt-4o',
    maxTokens: 1000,
    temperature: 0.8
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    // Clear console logs
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Reset environment
    process.env = { ...originalEnv };

    const { default: OpenAI } = await import('openai');
    mockOpenAI = {
      chat: {
        completions: {
          create: vi.fn()
        }
      }
    };
    (OpenAI as any).mockReturnValue(mockOpenAI);
    
    client = new OpenAILyricsClient(mockConfig);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should create client with provided config', () => {
      expect(client).toBeInstanceOf(OpenAILyricsClient);
    });

    it('should throw error if no API key provided', () => {
      expect(() => new OpenAILyricsClient({ apiKey: '' })).toThrow('OpenAI API key is required');
    });

    it('should use default options when not provided', () => {
      const clientWithDefaults = new OpenAILyricsClient({ apiKey: 'sk-test' });
      expect(clientWithDefaults).toBeInstanceOf(OpenAILyricsClient);
    });
  });

  describe('createChatCompletion', () => {
    const mockMessages = [
      { role: 'system' as const, content: 'You are a helpful assistant' },
      { role: 'user' as const, content: 'Hello' }
    ];

    const mockResponse = {
      choices: [
        {
          message: {
            content: 'Hello! How can I help you today?'
          }
        }
      ],
      usage: {
        total_tokens: 25
      }
    };

    it('should successfully create chat completion', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValueOnce(mockResponse);

      const result = await client.createChatCompletion(mockMessages);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o',
        messages: mockMessages,
        max_tokens: 1000,
        temperature: 0.8
      });

      expect(result).toBe('Hello! How can I help you today?');
    });

    it('should use custom options when provided', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValueOnce(mockResponse);

      await client.createChatCompletion(mockMessages, {
        model: 'gpt-3.5-turbo',
        maxTokens: 500,
        temperature: 0.5
      });

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: mockMessages,
        max_tokens: 500,
        temperature: 0.5
      });
    });

    it('should handle empty response content', async () => {
      const emptyResponse = {
        choices: [{ message: { content: null } }],
        usage: { total_tokens: 10 }
      };

      mockOpenAI.chat.completions.create.mockResolvedValueOnce(emptyResponse);

      const result = await client.createChatCompletion(mockMessages);

      expect(result).toBe('');
    });

    it('should handle OpenAI API errors', async () => {
      const error = new Error('API rate limit exceeded');
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(error);

      await expect(client.createChatCompletion(mockMessages)).rejects.toThrow('OpenAI API Error: API rate limit exceeded');
    });

    it('should handle unknown errors', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValueOnce('Unknown error');

      await expect(client.createChatCompletion(mockMessages)).rejects.toThrow('Unknown OpenAI API Error');
    });
  });

  describe('testConnection', () => {
    it('should successfully test connection with default message', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'OpenAI connection successful' } }],
        usage: { total_tokens: 15 }
      };

      mockOpenAI.chat.completions.create.mockResolvedValueOnce(mockResponse);

      const result = await client.testConnection();

      expect(result).toBe('OpenAI connection successful');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: "Hello, can you respond with 'OpenAI connection successful'?" }],
        max_tokens: 100,
        temperature: 0.7
      });
    });

    it('should test connection with custom message', async () => {
      const customMessage = 'Test custom message';
      const mockResponse = {
        choices: [{ message: { content: 'Custom response' } }],
        usage: { total_tokens: 10 }
      };

      mockOpenAI.chat.completions.create.mockResolvedValueOnce(mockResponse);

      const result = await client.testConnection(customMessage);

      expect(result).toBe('Custom response');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: customMessage }],
        max_tokens: 100,
        temperature: 0.7
      });
    });

    it('should handle connection test errors', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(new Error('Connection failed'));

      await expect(client.testConnection()).rejects.toThrow('OpenAI API Error: Connection failed');
    });
  });
});

describe('createOpenAIClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an OpenAILyricsClient instance', async () => {
    const { default: OpenAI } = await import('openai');
    (OpenAI as any).mockReturnValue({
      chat: { completions: { create: vi.fn() } }
    });

    const client = createOpenAIClient({ apiKey: 'sk-test' });
    expect(client).toBeInstanceOf(OpenAILyricsClient);
  });
});

describe('createOpenAIClientFromEnv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should create an OpenAILyricsClient instance from environment variables', async () => {
    process.env.OPENAI_API_KEY = 'sk-env-test-key';
    process.env.OPENAI_MODEL = 'gpt-3.5-turbo';
    process.env.OPENAI_MAX_TOKENS = '2000';
    process.env.OPENAI_TEMPERATURE = '0.9';
    
    const { default: OpenAI } = await import('openai');
    (OpenAI as any).mockReturnValue({
      chat: { completions: { create: vi.fn() } }
    });

    const client = createOpenAIClientFromEnv();
    expect(client).toBeInstanceOf(OpenAILyricsClient);
  });

  it('should use overrides when provided', async () => {
    process.env.OPENAI_API_KEY = 'sk-env-test-key';
    
    const { default: OpenAI } = await import('openai');
    (OpenAI as any).mockReturnValue({
      chat: { completions: { create: vi.fn() } }
    });

    const client = createOpenAIClientFromEnv({ 
      model: 'gpt-4-turbo',
      temperature: 0.5 
    });
    expect(client).toBeInstanceOf(OpenAILyricsClient);
  });

  it('should throw error when OPENAI_API_KEY is not set', () => {
    delete process.env.OPENAI_API_KEY;
    
    expect(() => createOpenAIClientFromEnv()).toThrow(
      'OPENAI_API_KEY environment variable is not set'
    );
  });
});

describe('validateOpenAIConfig', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return true for valid API key', () => {
    const result = validateOpenAIConfig('sk-1234567890abcdef');
    expect(result).toBe(true);
    expect(console.log).toHaveBeenCalledWith('✅ OpenAI configuration appears valid');
  });

  it('should return false for empty API key', () => {
    const result = validateOpenAIConfig('');
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('❌ OpenAI API key is not provided');
  });

  it('should return false for invalid API key format', () => {
    const result = validateOpenAIConfig('invalid-key-format');
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('❌ OpenAI API key does not appear to be valid (should start with sk-)');
  });
});
