import { describe, it, expect } from 'vitest';
import { GENRES } from './types';
import type { 
  Genre, 
  OpenAIConfig, 
  ChatCompletionOptions, 
  VerseGenerationOptions 
} from './types';

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

  describe('OpenAIConfig type', () => {
    it('should require apiKey', () => {
      const config: OpenAIConfig = {
        apiKey: 'sk-test1234567890'
      };
      
      expect(config.apiKey).toBe('sk-test1234567890');
    });

    it('should accept all optional fields', () => {
      const config: OpenAIConfig = {
        apiKey: 'sk-test1234567890',
        model: 'gpt-4o',
        maxTokens: 2000,
        temperature: 0.9
      };
      
      expect(config).toEqual({
        apiKey: 'sk-test1234567890',
        model: 'gpt-4o',
        maxTokens: 2000,
        temperature: 0.9
      });
    });
  });

  describe('ChatCompletionOptions type', () => {
    it('should accept empty options object', () => {
      const options: ChatCompletionOptions = {};
      
      expect(options).toEqual({});
    });

    it('should accept all optional fields', () => {
      const options: ChatCompletionOptions = {
        model: 'gpt-3.5-turbo',
        maxTokens: 1500,
        temperature: 0.5
      };
      
      expect(options).toEqual({
        model: 'gpt-3.5-turbo',
        maxTokens: 1500,
        temperature: 0.5
      });
    });

    it('should accept partial options', () => {
      const options1: ChatCompletionOptions = {
        model: 'gpt-4o'
      };
      
      const options2: ChatCompletionOptions = {
        temperature: 0.8
      };
      
      expect(options1.model).toBe('gpt-4o');
      expect(options2.temperature).toBe(0.8);
    });
  });

  describe('VerseGenerationOptions type', () => {
    it('should accept empty options object', () => {
      const options: VerseGenerationOptions = {};
      
      expect(options).toEqual({});
    });

    it('should accept all optional fields', () => {
      const options: VerseGenerationOptions = {
        verseCount: 3,
        linesPerVerse: '6-8',
        includeContext: true
      };
      
      expect(options).toEqual({
        verseCount: 3,
        linesPerVerse: '6-8',
        includeContext: true
      });
    });

    it('should accept partial options', () => {
      const options1: VerseGenerationOptions = {
        verseCount: 2
      };
      
      const options2: VerseGenerationOptions = {
        includeContext: false
      };
      
      const options3: VerseGenerationOptions = {
        linesPerVerse: '4-6'
      };
      
      expect(options1.verseCount).toBe(2);
      expect(options2.includeContext).toBe(false);
      expect(options3.linesPerVerse).toBe('4-6');
    });

    it('should handle different verse count values', () => {
      const options: VerseGenerationOptions = {
        verseCount: 5
      };
      
      expect(options.verseCount).toBe(5);
      expect(typeof options.verseCount).toBe('number');
    });

    it('should handle different line range formats', () => {
      const options1: VerseGenerationOptions = {
        linesPerVerse: '2-4'
      };
      
      const options2: VerseGenerationOptions = {
        linesPerVerse: '8-12'
      };
      
      expect(options1.linesPerVerse).toBe('2-4');
      expect(options2.linesPerVerse).toBe('8-12');
    });

    it('should handle boolean context values', () => {
      const optionsTrue: VerseGenerationOptions = {
        includeContext: true
      };
      
      const optionsFalse: VerseGenerationOptions = {
        includeContext: false
      };
      
      expect(optionsTrue.includeContext).toBe(true);
      expect(optionsFalse.includeContext).toBe(false);
    });
  });
});
