/**
 * Configuration module for Lyrics package
 * Loads environment variables using dotenv
 */

import { config } from 'dotenv';

// Load environment variables from .env file
config();

/**
 * Get OpenAI API key from environment variables
 */
export function getOpenAIApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is not set. ' +
      'Please add OPENAI_API_KEY=your_api_key to your .env file'
    );
  }
  
  return apiKey;
}

/**
 * Get default OpenAI model from environment variables with fallback
 */
export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-4o';
}

/**
 * Get default max tokens from environment variables with fallback
 */
export function getOpenAIMaxTokens(): number {
  const maxTokens = process.env.OPENAI_MAX_TOKENS;
  return maxTokens ? parseInt(maxTokens, 10) : 6000;
}

/**
 * Get default temperature from environment variables with fallback
 */
export function getOpenAITemperature(): number {
  const temperature = process.env.OPENAI_TEMPERATURE;
  return temperature ? parseFloat(temperature) : 0.7;
}

/**
 * Validate that all required environment variables are set
 */
export function validateOpenAIEnvironment(): boolean {
  try {
    getOpenAIApiKey();
    console.log('✅ OpenAI environment variables are properly configured');
    return true;
  } catch (error) {
    console.error('❌ OpenAI environment configuration error:', (error as Error).message);
    return false;
  }
}
