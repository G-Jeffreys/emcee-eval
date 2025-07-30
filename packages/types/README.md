# @repo/types

Shared TypeScript types for the AI Rap Battle application.

## Overview

This package contains all the shared type definitions used across the frontend, backend, and other packages to ensure consistency in data structures throughout the application.

## Key Types

### AI Battler Types
- `AIBattler` - Allowed AI models (`'grok' | 'openai' | 'gemini' | 'anthropic'`)
- `AI_BATTLERS` - Array of valid battler names
- `isValidAIBattler()` - Type guard function
- `normalizeAIBattler()` - Validation with warning + default to 'openai'

### Battle Types
- `Battle` - Complete battle information with verses
- `BattleStatus` - Battle status enum (`pending`, `generating`, `completed`, `failed`)
- `CreateBattleRequest` - Battle creation request
- `CreateBattleResponse` - Battle creation response

### Verse Types
- `Verse` - A single verse with audio and timing data
- `LyricsSection` - Lyric section (verse, chorus, etc.) with timing
- `Line` - Line-level timing with word breakdown
- `Word` - Word-level timing for karaoke synchronization

## Usage

```typescript
import { 
  Battle, 
  Verse, 
  BattleStatus, 
  AIBattler, 
  normalizeAIBattler 
} from '@repo/types';

// Validate AI names with warnings
const aiName = normalizeAIBattler('ChatGPT', 'battle creation');
// ⚠️ Warning: Invalid AI battler name: "ChatGPT" (battle creation). 
// Valid options are: grok, openai, gemini, anthropic. Defaulting to 'openai'.
// Returns: 'openai'

const battle: Battle = {
  battle_id: '123',
  ai_one: 'openai',
  ai_two: 'anthropic',
  status: 'completed',
  verses: [/* ... */]
};
```

## Data Flow

These types ensure consistency between:
- **API responses** (tRPC endpoints)
- **Frontend components** (React components)
- **Database models** (via transformations)
- **Job queue data** (background processing)

## Development

```bash
# Build types
pnpm build

# Type check
pnpm check-types

# Watch mode
pnpm dev
```
