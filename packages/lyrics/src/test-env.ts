/**
 * Test script to verify environment variable loading
 * Run with: pnpm tsx src/test-env.ts
 */

import { validateOpenAIEnvironment, createOpenAIClientFromEnv } from './index.js';

console.log('🧪 Testing OpenAI environment configuration...\n');

// Test environment validation
const isValid = validateOpenAIEnvironment();

if (isValid) {
  try {
    console.log('🤖 Creating OpenAI client from environment...');
    const client = createOpenAIClientFromEnv();
    console.log('✅ OpenAI client created successfully!');
    
    // Test connection
    console.log('🔗 Testing OpenAI connection...');
    const response = await client.testConnection();
    console.log('📝 OpenAI Response:', response);
    console.log('🎯 Ready to generate lyrics with OpenAI API');
  } catch (error) {
    console.error('❌ Failed to create or test OpenAI client:', (error as Error).message);
  }
} else {
  console.log('❌ Environment validation failed. Please check your .env file.');
}

console.log('\n📝 Make sure your .env file contains:');
console.log('OPENAI_API_KEY=your_openai_api_key_here');
console.log('OPENAI_MODEL=gpt-4o (optional, defaults to gpt-4o)');
console.log('OPENAI_MAX_TOKENS=6000 (optional, defaults to 6000)');
console.log('OPENAI_TEMPERATURE=0.7 (optional, defaults to 0.7)');
