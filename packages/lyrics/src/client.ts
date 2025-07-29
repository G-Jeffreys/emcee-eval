/**
 * OpenAI Client
 * 
 * This module provides a centralized client for making calls to the OpenAI API.
 * All other OpenAI-related functions should use this client instead of creating their own.
 */

import OpenAI from 'openai';
import type { OpenAIConfig, ChatCompletionOptions } from './types.js';
import { getOpenAIApiKey, getOpenAIModel, getOpenAIMaxTokens, getOpenAITemperature } from './config.js';

/**
 * OpenAI Client class
 */
export class OpenAILyricsClient {
  private client: OpenAI;
  private defaultOptions: Required<ChatCompletionOptions>;

  constructor(config: OpenAIConfig) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.client = new OpenAI({
      apiKey: config.apiKey,
    });

    this.defaultOptions = {
      model: config.model || getOpenAIModel(),
      maxTokens: config.maxTokens || getOpenAIMaxTokens(),
      temperature: config.temperature || getOpenAITemperature(),
    };
  }

  /**
   * Make a chat completion request to OpenAI
   * 
   * @param messages - Array of messages for the conversation
   * @param options - Optional configuration for the request
   * @returns Promise<string> - The response content from OpenAI
   */
  async createChatCompletion(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    try {
      const finalOptions = {
        ...this.defaultOptions,
        ...options,
      };

      console.log('🤖 OpenAI - Creating chat completion:', {
        model: finalOptions.model,
        maxTokens: finalOptions.maxTokens,
        temperature: finalOptions.temperature,
        messageCount: messages.length
      });

      const completion = await this.client.chat.completions.create({
        model: finalOptions.model,
        messages,
        max_tokens: finalOptions.maxTokens,
        temperature: finalOptions.temperature,
      });

      const response = completion.choices[0]?.message?.content?.trim() || '';
      
      console.log('✅ OpenAI - Chat completion successful:', {
        responseLength: response.length,
        tokensUsed: completion.usage?.total_tokens || 'unknown'
      });
      
      return response;
    } catch (error) {
      console.error('❌ OpenAI - Chat completion failed:', error);
      
      if (error instanceof Error) {
        throw new Error(`OpenAI API Error: ${error.message}`);
      }
      
      throw new Error('Unknown OpenAI API Error');
    }
  }

  /**
   * Test function to verify OpenAI API connectivity
   * 
   * @param message - Test message to send to the API
   * @returns Promise<string> - Response from OpenAI
   */
  async testConnection(message: string = "Hello, can you respond with 'OpenAI connection successful'?"): Promise<string> {
    try {
      console.log('🤖 Testing OpenAI connection...');
      console.log('📤 Sending message:', message);

      const response = await this.createChatCompletion([
        {
          role: 'user',
          content: message
        }
      ], {
        maxTokens: 100,
        temperature: 0.7
      });
      
      console.log('📥 Received response:', response);
      console.log('✅ OpenAI connection test successful');
      
      return response;
    } catch (error) {
      console.error('❌ OpenAI connection test failed:', error);
      throw error;
    }
  }
}

/**
 * Create an OpenAI client instance
 */
export function createOpenAIClient(config: OpenAIConfig): OpenAILyricsClient {
  return new OpenAILyricsClient(config);
}

/**
 * Create an OpenAI client instance using environment variables
 */
export function createOpenAIClientFromEnv(overrides: Partial<OpenAIConfig> = {}): OpenAILyricsClient {
  return new OpenAILyricsClient({
    apiKey: getOpenAIApiKey(),
    model: getOpenAIModel(),
    maxTokens: getOpenAIMaxTokens(),
    temperature: getOpenAITemperature(),
    ...overrides
  });
}

/**
 * Validate OpenAI configuration
 * 
 * @returns boolean - Whether the OpenAI client is properly configured
 */
export function validateOpenAIConfig(apiKey: string): boolean {
  if (!apiKey) {
    console.error('❌ OpenAI API key is not provided');
    return false;
  }
  
  if (!apiKey.startsWith('sk-')) {
    console.error('❌ OpenAI API key does not appear to be valid (should start with sk-)');
    return false;
  }
  
  console.log('✅ OpenAI configuration appears valid');
  return true;
}
