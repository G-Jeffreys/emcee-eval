# @repo/mureka

Mureka AI API client for song generation.

## Installation

```bash
pnpm add @repo/mureka
```

## Setup

Create a `.env` file in your project root:

```env
MUREKA_API_KEY=your_mureka_api_key_here
MUREKA_BASE_URL=https://api.mureka.ai  # optional, defaults to https://api.mureka.ai
```

## Usage

### Using Environment Variables (Recommended)

```typescript
import { createMurekaClientFromEnv, validateMurekaEnvironment } from '@repo/mureka';

// Validate environment setup
if (!validateMurekaEnvironment()) {
  throw new Error('Mureka environment not configured properly');
}

// Create client from environment variables
const client = createMurekaClientFromEnv();

// Generate a song
const song = await client.generateSong({
  lyrics: 'Your rap lyrics here',
  genre: 'rap'
});

console.log('Song generation started:', song.id);

// Poll for completion
const completedSong = await client.pollSongCompletion(song.id, {
  maxWaitTime: 300000, // 5 minutes
  pollInterval: 5000,  // 5 seconds
  onProgress: (status) => {
    console.log('Generation status:', status.status);
  }
});

console.log('Song URL:', completedSong.choices?.[0]?.url);
```

### Manual Configuration

```typescript
import { createMurekaClient } from '@repo/mureka';

const client = createMurekaClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.mureka.ai' // optional
});

const song = await client.generateSong({
  lyrics: 'Your lyrics here',
  genre: 'rap',
  model: 'mureka-6',
  prompt: 'custom prompt for style'
});
```

## API Reference

### Types

- `Genre`: `'rap' | 'rock' | 'country'`
- `SongGenerationRequest`: Request parameters for song generation
- `SongGenerationResponse`: Response from Mureka API

### Methods

- `generateSong(request)`: Start song generation
- `getSongStatus(taskId)`: Get current status of generation
- `pollSongCompletion(taskId, options)`: Poll until completion with timeout

### Configuration Functions

- `validateMurekaEnvironment()`: Check if environment variables are set
- `createMurekaClientFromEnv()`: Create client using environment variables
- `getMurekaApiKey()`: Get API key from environment
- `getMurekaBaseUrl()`: Get base URL from environment

## Testing

```bash
# Run tests
pnpm test:run

# Test environment configuration
pnpm test:env
```
