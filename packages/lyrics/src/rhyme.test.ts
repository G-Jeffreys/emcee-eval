import { describe, it, expect, beforeEach, vi } from 'vitest';
import { makeItRhyme } from './rhyme';
import type { OpenAILyricsClient } from './client';

describe('makeItRhyme', () => {
  let mockClient: OpenAILyricsClient;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    mockClient = {
      createChatCompletion: vi.fn()
    } as any;
  });

  describe('basic functionality', () => {
    it('should transform text to rhyme better for rap genre', async () => {
      const originalText = 'I like to code every day';
      const transformedText = 'I like to code in every way\nMy skills grow stronger day by day';

      (mockClient.createChatCompletion as any).mockResolvedValueOnce(transformedText);

      const result = await makeItRhyme(mockClient, originalText, '', 'rap');

      expect(result).toBe(transformedText);
      expect(mockClient.createChatCompletion).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('expert rap lyricist')
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining(originalText)
          })
        ]),
        expect.objectContaining({
          model: 'gpt-4o',
          maxTokens: 500,
          temperature: 0.8
        })
      );
    });

    it('should work with rock genre', async () => {
      const originalText = 'The world is changing fast';
      const transformedText = 'The world is changing fast\nNothing good can ever last';

      (mockClient.createChatCompletion as any).mockResolvedValueOnce(transformedText);

      const result = await makeItRhyme(mockClient, originalText, '', 'rock');

      expect(result).toBe(transformedText);
      expect(mockClient.createChatCompletion).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('expert rock lyricist')
          })
        ]),
        expect.any(Object)
      );
    });

    it('should work with country genre', async () => {
      const originalText = 'Missing my hometown';
      const transformedText = 'Missing my hometown tonight\nWhere the stars shine bright';

      (mockClient.createChatCompletion as any).mockResolvedValueOnce(transformedText);

      const result = await makeItRhyme(mockClient, originalText, '', 'country');

      expect(result).toBe(transformedText);
      expect(mockClient.createChatCompletion).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('expert country music lyricist')
          })
        ]),
        expect.any(Object)
      );
    });
  });

  describe('context handling', () => {
    it('should include full text context when provided', async () => {
      const selectedText = 'I love music';
      const fullText = 'Verse 1:\nI love music\nIt makes me feel alive';
      const transformedText = 'I love music so much\nIt gives my soul a touch';

      (mockClient.createChatCompletion as any).mockResolvedValueOnce(transformedText);

      await makeItRhyme(mockClient, selectedText, fullText, 'rap');

      expect(mockClient.createChatCompletion).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining(fullText)
          })
        ]),
        expect.any(Object)
      );
    });

    it('should work without context when fullText is empty', async () => {
      const selectedText = 'I love music';
      const transformedText = 'I love music so divine\nEvery beat and every line';

      (mockClient.createChatCompletion as any).mockResolvedValueOnce(transformedText);

      await makeItRhyme(mockClient, selectedText, '', 'rap');

      expect(mockClient.createChatCompletion).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.not.stringContaining('full document for context')
          })
        ]),
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    it('should return original text if transformation fails', async () => {
      const originalText = 'I like to code every day';

      (mockClient.createChatCompletion as any).mockResolvedValueOnce('');

      const result = await makeItRhyme(mockClient, originalText, '', 'rap');

      expect(result).toBe(originalText);
    });

    it('should handle API errors gracefully', async () => {
      const originalText = 'I like to code every day';
      const error = new Error('API Error');

      (mockClient.createChatCompletion as any).mockRejectedValueOnce(error);

      await expect(makeItRhyme(mockClient, originalText, '', 'rap'))
        .rejects.toThrow('Make It Rhyme Error: API Error');
    });

    it('should handle unknown errors', async () => {
      const originalText = 'I like to code every day';

      (mockClient.createChatCompletion as any).mockRejectedValueOnce('Unknown error');

      await expect(makeItRhyme(mockClient, originalText, '', 'rap'))
        .rejects.toThrow('Unknown Make It Rhyme Error');
    });
  });

  describe('default parameters', () => {
    it('should use default genre when not provided', async () => {
      const originalText = 'I like to code every day';
      const transformedText = 'Code flows through me like a stream';

      (mockClient.createChatCompletion as any).mockResolvedValueOnce(transformedText);

      await makeItRhyme(mockClient, originalText);

      expect(mockClient.createChatCompletion).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('expert rap lyricist')
          })
        ]),
        expect.any(Object)
      );
    });

    it('should handle empty fullText parameter', async () => {
      const originalText = 'I like to code every day';
      const transformedText = 'Code flows through me like a stream';

      (mockClient.createChatCompletion as any).mockResolvedValueOnce(transformedText);

      const result = await makeItRhyme(mockClient, originalText);

      expect(result).toBe(transformedText);
    });
  });

  describe('logging', () => {
    it('should log transformation details', async () => {
      const originalText = 'I like to code every day';
      const transformedText = 'Code flows through me like a stream';

      (mockClient.createChatCompletion as any).mockResolvedValueOnce(transformedText);

      await makeItRhyme(mockClient, originalText, '', 'rap');

      expect(console.log).toHaveBeenCalledWith(
        '🎤 AI - Making text rhyme:',
        expect.objectContaining({
          selectedText: expect.stringContaining('I like to code'),
          hasContext: false,
          genre: 'rap'
        })
      );

      expect(console.log).toHaveBeenCalledWith(
        '🎤 AI - Transformation successful:',
        expect.objectContaining({
          originalLength: originalText.length,
          transformedLength: transformedText.length,
          original: originalText,
          transformed: transformedText,
          genre: 'rap'
        })
      );
    });
  });
});
