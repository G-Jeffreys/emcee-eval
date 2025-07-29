# @repo/lyrics

OpenAI-powered lyrics generation and enhancement.

## Installation

```bash
pnpm add @repo/lyrics
```

## Setup

Create a `.env` file in your project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o                    # optional, defaults to gpt-4o
OPENAI_MAX_TOKENS=6000                 # optional, defaults to 6000
OPENAI_TEMPERATURE=0.7                 # optional, defaults to 0.7
```

## Usage

### Using Environment Variables (Recommended)

```typescript
import { 
  createOpenAIClientFromEnv, 
  validateOpenAIEnvironment,
  makeItRhyme,
  generateChorus,
  addVerse
} from '@repo/lyrics';

// Validate environment setup
if (!validateOpenAIEnvironment()) {
  throw new Error('OpenAI environment not configured properly');
}

// Create client from environment variables
const client = createOpenAIClientFromEnv();

// Transform text to rhyme better
const rhymedText = await makeItRhyme(
  client,
  'I love to code every day',
  '', // full text context (optional)
  'rap'
);

// Generate a chorus for a song
const songWithChorus = await generateChorus(
  client,
  'Verse 1:\nI wake up every morning\nCode is calling my name...',
  'rap'
);

// Add a new verse
const expandedSong = await addVerse(
  client,
  songWithChorus,
  'rap'
);
```

### Manual Configuration

```typescript
import { createOpenAIClient, makeItRhyme } from '@repo/lyrics';

const client = createOpenAIClient({
  apiKey: 'your-openai-key',
  model: 'gpt-4o',
  maxTokens: 4000,
  temperature: 0.8
});

const rhymedText = await makeItRhyme(client, 'Original text', '', 'rap');
```

## API Reference

### Types

- `Genre`: `'rap' | 'rock' | 'country'`
- `OpenAIConfig`: Configuration for OpenAI client
- `ChatCompletionOptions`: Options for chat completion requests
- `VerseGenerationOptions`: Options for verse generation

### Core Functions

#### Text Enhancement
- `makeItRhyme(client, text, context?, genre?)`: Transform text to rhyme better

#### Song Structure
- `detectChorus(client, text, genre)`: Detect if song has a chorus
- `generateChorus(client, text, genre)`: Add chorus to song
- `replaceChorus(client, text, genre)`: Replace existing chorus
- `addVerse(client, text, genre)`: Add new verse to song
- `generateVersesFromDescription(client, description, context?, genre?, options?)`: Generate verses from description

#### Client Management
- `createOpenAIClient(config)`: Create client with manual config
- `createOpenAIClientFromEnv(overrides?)`: Create client from environment variables
- `validateOpenAIConfig(apiKey)`: Validate API key format

#### Configuration
- `validateOpenAIEnvironment()`: Check environment variables
- `getOpenAIApiKey()`: Get API key from environment
- `getOpenAIModel()`: Get model from environment
- `getOpenAIMaxTokens()`: Get max tokens from environment
- `getOpenAITemperature()`: Get temperature from environment

## Examples

### Rap Battle Verse Generation

```typescript
const client = createOpenAIClientFromEnv();

// Generate battle verses
const verses = await generateVersesFromDescription(
  client,
  'A fierce rap battle about coding skills and programming languages',
  '', // no existing context
  'rap',
  {
    verseCount: 2,
    linesPerVerse: '6-8',
    includeContext: false
  }
);

console.log('Battle verses:', verses);
```

### Song Enhancement Pipeline

```typescript
const client = createOpenAIClientFromEnv();

let song = 'Basic lyrics about my day';

// Step 1: Make it rhyme better
song = await makeItRhyme(client, song, '', 'rap');

// Step 2: Add more verses
song = await addVerse(client, song, 'rap');

// Step 3: Generate a chorus
song = await generateChorus(client, song, 'rap');

console.log('Enhanced song:', song);
```

## Testing

```bash
# Run tests
pnpm test:run

# Test environment configuration (requires valid API key)
pnpm test:env
```

## Genre Support

All functions support three music genres:
- **rap**: Hip-hop style with rhythmic flow and wordplay
- **rock**: Powerful, energetic with memorable hooks  
- **country**: Storytelling with heartfelt, melodic lyrics

Each genre uses specialized prompts optimized for that musical style.
