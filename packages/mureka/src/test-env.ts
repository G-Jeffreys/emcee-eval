/**
 * Test script to verify environment variable loading
 * Run with: pnpm tsx src/test-env.ts
 */

import { validateMurekaEnvironment, createMurekaClientFromEnv } from './index.js';

console.log('🧪 Testing Mureka environment configuration...\n');

// Test environment validation
const isValid = validateMurekaEnvironment();

if (isValid) {
  try {
    console.log('🎵 Creating Mureka client from environment...');
    const client = createMurekaClientFromEnv();
    console.log('✅ Mureka client created successfully!');
    console.log('🎯 Ready to generate songs with Mureka API');
  } catch (error) {
    console.error('❌ Failed to create Mureka client:', (error as Error).message);
  }
} else {
  console.log('❌ Environment validation failed. Please check your .env file.');
}

console.log('\n📝 Make sure your .env file contains:');
console.log('MUREKA_API_KEY=your_mureka_api_key_here');
console.log('MUREKA_BASE_URL=https://api.mureka.ai (optional)');
