import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getMurekaApiKey, getMurekaBaseUrl, validateMurekaEnvironment } from './config';

describe('Mureka Config', () => {
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

  describe('getMurekaApiKey', () => {
    it('should return API key when set', () => {
      process.env.MUREKA_API_KEY = 'test-mureka-key';
      
      const apiKey = getMurekaApiKey();
      
      expect(apiKey).toBe('test-mureka-key');
    });

    it('should throw error when API key is not set', () => {
      delete process.env.MUREKA_API_KEY;
      
      expect(() => getMurekaApiKey()).toThrow(
        'MUREKA_API_KEY environment variable is not set. Please add MUREKA_API_KEY=your_api_key to your .env file'
      );
    });

    it('should throw error when API key is empty string', () => {
      process.env.MUREKA_API_KEY = '';
      
      expect(() => getMurekaApiKey()).toThrow(
        'MUREKA_API_KEY environment variable is not set. Please add MUREKA_API_KEY=your_api_key to your .env file'
      );
    });
  });

  describe('getMurekaBaseUrl', () => {
    it('should return custom base URL when set', () => {
      process.env.MUREKA_BASE_URL = 'https://custom.mureka.ai';
      
      const baseUrl = getMurekaBaseUrl();
      
      expect(baseUrl).toBe('https://custom.mureka.ai');
    });

    it('should return default base URL when not set', () => {
      delete process.env.MUREKA_BASE_URL;
      
      const baseUrl = getMurekaBaseUrl();
      
      expect(baseUrl).toBe('https://api.mureka.ai');
    });

    it('should return default base URL when empty string', () => {
      process.env.MUREKA_BASE_URL = '';
      
      const baseUrl = getMurekaBaseUrl();
      
      expect(baseUrl).toBe('https://api.mureka.ai');
    });
  });

  describe('validateMurekaEnvironment', () => {
    it('should return true when API key is properly set', () => {
      process.env.MUREKA_API_KEY = 'test-mureka-key';
      
      const isValid = validateMurekaEnvironment();
      
      expect(isValid).toBe(true);
      expect(console.log).toHaveBeenCalledWith('✅ Mureka environment variables are properly configured');
    });

    it('should return false when API key is not set', () => {
      delete process.env.MUREKA_API_KEY;
      
      const isValid = validateMurekaEnvironment();
      
      expect(isValid).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        '❌ Mureka environment configuration error:',
        'MUREKA_API_KEY environment variable is not set. Please add MUREKA_API_KEY=your_api_key to your .env file'
      );
    });

    it('should return false when API key is empty', () => {
      process.env.MUREKA_API_KEY = '';
      
      const isValid = validateMurekaEnvironment();
      
      expect(isValid).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        '❌ Mureka environment configuration error:',
        'MUREKA_API_KEY environment variable is not set. Please add MUREKA_API_KEY=your_api_key to your .env file'
      );
    });
  });
});
