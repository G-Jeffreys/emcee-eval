import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getOpenAIApiKey, 
  getOpenAIModel, 
  getOpenAIMaxTokens, 
  getOpenAITemperature, 
  validateOpenAIEnvironment 
} from './config';

describe('Lyrics Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
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

  describe('getOpenAIApiKey', () => {
    it('should return API key when set', () => {
      process.env.OPENAI_API_KEY = 'sk-test1234567890';
      
      const apiKey = getOpenAIApiKey();
      
      expect(apiKey).toBe('sk-test1234567890');
    });

    it('should throw error when API key is not set', () => {
      delete process.env.OPENAI_API_KEY;
      
      expect(() => getOpenAIApiKey()).toThrow(
        'OPENAI_API_KEY environment variable is not set. Please add OPENAI_API_KEY=your_api_key to your .env file'
      );
    });

    it('should throw error when API key is empty string', () => {
      process.env.OPENAI_API_KEY = '';
      
      expect(() => getOpenAIApiKey()).toThrow(
        'OPENAI_API_KEY environment variable is not set. Please add OPENAI_API_KEY=your_api_key to your .env file'
      );
    });
  });

  describe('getOpenAIModel', () => {
    it('should return custom model when set', () => {
      process.env.OPENAI_MODEL = 'gpt-3.5-turbo';
      
      const model = getOpenAIModel();
      
      expect(model).toBe('gpt-3.5-turbo');
    });

    it('should return default model when not set', () => {
      delete process.env.OPENAI_MODEL;
      
      const model = getOpenAIModel();
      
      expect(model).toBe('gpt-4o');
    });

    it('should return default model when empty string', () => {
      process.env.OPENAI_MODEL = '';
      
      const model = getOpenAIModel();
      
      expect(model).toBe('gpt-4o');
    });
  });

  describe('getOpenAIMaxTokens', () => {
    it('should return custom max tokens when set', () => {
      process.env.OPENAI_MAX_TOKENS = '2000';
      
      const maxTokens = getOpenAIMaxTokens();
      
      expect(maxTokens).toBe(2000);
    });

    it('should return default max tokens when not set', () => {
      delete process.env.OPENAI_MAX_TOKENS;
      
      const maxTokens = getOpenAIMaxTokens();
      
      expect(maxTokens).toBe(6000);
    });

    it('should return default max tokens when empty string', () => {
      process.env.OPENAI_MAX_TOKENS = '';
      
      const maxTokens = getOpenAIMaxTokens();
      
      expect(maxTokens).toBe(6000);
    });

    it('should handle invalid number strings', () => {
      process.env.OPENAI_MAX_TOKENS = 'invalid';
      
      const maxTokens = getOpenAIMaxTokens();
      
      expect(maxTokens).toBeNaN();
    });
  });

  describe('getOpenAITemperature', () => {
    it('should return custom temperature when set', () => {
      process.env.OPENAI_TEMPERATURE = '0.9';
      
      const temperature = getOpenAITemperature();
      
      expect(temperature).toBe(0.9);
    });

    it('should return default temperature when not set', () => {
      delete process.env.OPENAI_TEMPERATURE;
      
      const temperature = getOpenAITemperature();
      
      expect(temperature).toBe(0.7);
    });

    it('should return default temperature when empty string', () => {
      process.env.OPENAI_TEMPERATURE = '';
      
      const temperature = getOpenAITemperature();
      
      expect(temperature).toBe(0.7);
    });

    it('should handle invalid number strings', () => {
      process.env.OPENAI_TEMPERATURE = 'invalid';
      
      const temperature = getOpenAITemperature();
      
      expect(temperature).toBeNaN();
    });
  });

  describe('validateOpenAIEnvironment', () => {
    it('should return true when API key is properly set', () => {
      process.env.OPENAI_API_KEY = 'sk-test1234567890';
      
      const isValid = validateOpenAIEnvironment();
      
      expect(isValid).toBe(true);
      expect(console.log).toHaveBeenCalledWith('✅ OpenAI environment variables are properly configured');
    });

    it('should return false when API key is not set', () => {
      delete process.env.OPENAI_API_KEY;
      
      const isValid = validateOpenAIEnvironment();
      
      expect(isValid).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        '❌ OpenAI environment configuration error:',
        'OPENAI_API_KEY environment variable is not set. Please add OPENAI_API_KEY=your_api_key to your .env file'
      );
    });

    it('should return false when API key is empty', () => {
      process.env.OPENAI_API_KEY = '';
      
      const isValid = validateOpenAIEnvironment();
      
      expect(isValid).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        '❌ OpenAI environment configuration error:',
        'OPENAI_API_KEY environment variable is not set. Please add OPENAI_API_KEY=your_api_key to your .env file'
      );
    });
  });
});
