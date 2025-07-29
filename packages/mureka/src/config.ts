/**
 * Configuration module for Mureka package
 * Loads environment variables using dotenv
 */

import { config } from 'dotenv';

// Load environment variables from .env file
config();

/**
 * Get Mureka API key from environment variables
 */
export function getMurekaApiKey(): string {
  const apiKey = process.env.MUREKA_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'MUREKA_API_KEY environment variable is not set. ' +
      'Please add MUREKA_API_KEY=your_api_key to your .env file'
    );
  }
  
  return apiKey;
}

/**
 * Get Mureka base URL from environment variables with fallback
 */
export function getMurekaBaseUrl(): string {
  return process.env.MUREKA_BASE_URL || 'https://api.mureka.ai';
}

/**
 * Validate that all required environment variables are set
 */
export function validateMurekaEnvironment(): boolean {
  try {
    getMurekaApiKey();
    console.log('✅ Mureka environment variables are properly configured');
    return true;
  } catch (error) {
    console.error('❌ Mureka environment configuration error:', (error as Error).message);
    return false;
  }
}
