# 🎤 KaraokeBox Component

A React component for displaying synchronized lyrics with real-time word-by-word highlighting for AI rap battles.

## 📋 Overview

The KaraokeBox component provides a karaoke-style experience that syncs lyrics with audio playback, highlighting individual words as they're spoken/sung. It's designed to work with the AI rap battle system's generated verses.

## 🔧 Core Files

- **Component**: `apps/web/src/components/KaraokeBox.tsx`
- **Types**: `apps/web/src/types/battle.ts`
- **Test Data**: `apps/web/src/data/karaokeTestData.ts`
- **Demo Pages**: 
  - `apps/web/src/pages/KaraokeDemo.tsx` (with API integration)
  - `apps/web/src/pages/KaraokeTest.tsx` (standalone testing)

## 🚀 Quick Start

### Basic Usage

```tsx
import { KaraokeBox } from "@/components/KaraokeBox";

function MyComponent() {
  const verse = {
    url: "https://example.com/audio.mp3",
    ai: "CodeRapper",
    duration: 30000, // 30 seconds in milliseconds
    lyrics_sections: [
      {
        section_type: "verse",
        start: 1000,
        end: 10000,
        lines: [
          {
            start: 1000,
            end: 5000,
            text: "Hello world from AI",
            words: [
              { start: 1000, end: 2000, text: "Hello " },
              { start: 2000, end: 3000, text: "world " },
              { start: 3000, end: 4000, text: "from " },
              { start: 4000, end: 5000, text: "AI" }
            ]
          }
        ]
      }
    ]
  };

  return <KaraokeBox verse={verse} />;
}
```

## 📊 Data Structure

### Verse Interface

```typescript
interface Verse {
  url: string;           // Audio file URL
  ai: string;            // Rapper/AI name
  duration: number;      // Total duration in milliseconds
  lyrics_sections: LyricsSection[];
}
```

### LyricsSection Interface

```typescript
interface LyricsSection {
  section_type: string;  // "verse", "intro", "chorus", etc.
  start: number;         // Section start time in milliseconds
  end: number;           // Section end time in milliseconds
  lines?: Line[];        // Array of lyric lines (optional for instrumental sections)
}
```

### Line Interface

```typescript
interface Line {
  start: number;         // Line start time in milliseconds
  end: number;           // Line end time in milliseconds
  text: string;          // Complete line text
  words: Word[];         // Individual words with timing
}
```

### Word Interface

```typescript
interface Word {
  start: number;         // Word start time in milliseconds
  end: number;           // Word end time in milliseconds
  text: string;          // Word text (include trailing space if needed)
}
```

## ✨ Features

### Visual Highlighting
- **Yellow highlight**: Current word being spoken
- **Green text**: Words already spoken
- **Gray text**: Upcoming words
- **Context display**: Shows previous and next lines for context

### Audio Controls
- **Play/Pause**: Standard audio controls
- **Seek bar**: Jump to any point in the timeline
- **Section buttons**: Quick jump to verse, intro, etc.
- **Time display**: Current time / total duration

### Playback Modes
- **🎵 Audio Mode**: Syncs with actual audio playback
- **🎯 Demo Mode**: Uses system timer for perfect timing (useful when audio is unavailable or short)

### Smart Features
- **Duration mismatch detection**: Warns when audio is shorter than lyrics expect
- **Flexible timing**: Works with audio URLs or falls back to timeline-based playback
- **Section navigation**: Automatically highlights active section

## 🔌 Integration Guide

### 1. With Existing Battle System

```tsx
// In your battle viewer component
import { KaraokeBox } from "@/components/KaraokeBox";

function BattleViewer({ battle }) {
  return (
    <div>
      <h2>{battle.ai_one} vs {battle.ai_two}</h2>
      
      {battle.verses.map((verse, index) => (
        <div key={index} className="mb-8">
          <h3>{verse.ai} - Round {index + 1}</h3>
          <KaraokeBox verse={verse} />
        </div>
      ))}
    </div>
  );
}
```

### 2. With tRPC API

```tsx
// Using the existing battle API
function KaraokePage() {
  const { data: battle } = trpc.battles.get.useQuery({ 
    battle_id: "battle-3" 
  });

  if (!battle?.verses.length) {
    return <div>No verses available</div>;
  }

  return (
    <div>
      {battle.verses.map((verse, index) => (
        <KaraokeBox key={index} verse={verse} />
      ))}
    </div>
  );
}
```

### 3. Props

```typescript
interface KaraokeBoxProps {
  verse: Verse;          // Required: Verse data with lyrics and timing
  className?: string;    // Optional: Additional CSS classes
}
```

## 🧪 Testing

### Demo Pages

1. **Visit `/karaoke`**: 
   - Integrates with battle API
   - Toggle between real data and test mode
   - Shows all battle statuses (pending/generating/completed)

2. **Visit `/karaoke-test`**:
   - Standalone testing environment
   - Multiple test verses with different timing patterns
   - No API dependencies

### Test Data

The component includes three test verses:

1. **CodeRapper** (Real Audio): Uses actual Mureka-generated audio with complex timing
2. **TestMC** (Simple): 1-second-per-word timing for predictable testing
3. **FlowBot** (Variable): Fast/slow sections with intro/verse structure

### Testing Checklist

- [ ] Audio loads and plays correctly
- [ ] Words highlight in sync with audio
- [ ] Section jumping works (click section buttons)
- [ ] Seek bar allows scrubbing through timeline
- [ ] Demo mode works when audio is unavailable
- [ ] Visual states (past/current/future words) display correctly
- [ ] Component handles missing or malformed data gracefully

## 🎯 Production Integration

### Data Requirements

Your lyric generation system needs to output data matching the `Verse` interface. Key points:

1. **Timing in milliseconds**: All start/end times should be in milliseconds
2. **Word-level timing**: Each word needs individual start/end times
3. **Audio URL**: Must be accessible from the browser (CORS-enabled)
4. **Section types**: Use consistent naming ("verse", "intro", "chorus", etc.)

### Example Data Flow

```
AI Battle Generator → Verse Object → KaraokeBox Component
                                   ↓
                         Real-time synchronized display
```

### Performance Considerations

- **Audio loading**: Component handles loading states automatically
- **Update frequency**: Updates every 50ms for smooth highlighting
- **Memory**: Cleans up timers on unmount
- **Network**: Only loads audio when play button is clicked

## 🐛 Troubleshooting

### Common Issues

**Audio doesn't play**:
- Check CORS policy on audio URL
- Verify audio format is supported (MP3 recommended)
- Test with demo mode to isolate audio issues

**Timing is off**:
- Verify all timestamps are in milliseconds
- Check that audio duration matches `verse.duration`
- Use demo mode for precise timing testing

**Words don't highlight**:
- Ensure word timing data is present
- Check that `currentTime` is within word start/end range
- Verify section timing encompasses word timing

**Section jumping doesn't work**:
- Check that sections have valid start/end times
- Ensure section times don't overlap incorrectly
- Test with included demo data first

### Debug Mode

Enable demo mode to isolate issues:
1. Click "🎯 Demo Mode" button
2. Uses system timer instead of audio
3. Perfect for testing timing logic

## 📝 Development Notes

### Component Structure

```
KaraokeBox
├── Audio Controls (play/pause/seek/mode toggle)
├── Lyrics Display
│   ├── Previous Line (context)
│   ├── Current Line (with word highlighting)
│   └── Next Line (context)
├── Section Navigation (quick jump buttons)
└── Hidden Audio Element
```

### State Management

- `currentTime`: Current playback position (seconds)
- `isPlaying`: Audio/timer playing state
- `demoMode`: Toggle between audio and timer modes
- `actualAudioDuration`: Real audio duration (may differ from verse.duration)

### Timer Logic

- **Audio Mode**: Syncs with `audio.currentTime`
- **Demo Mode**: Uses `Date.now()` for precise system timing
- **Update interval**: 50ms for smooth word transitions

## 🔄 Future Enhancements

Potential features for future development:

- **Multi-verse battles**: Side-by-side karaoke for rap battles
- **Recording mode**: Allow users to record their own performances
- **Scoring system**: Rate user performance against original timing
- **Mobile optimization**: Touch-friendly controls and gestures
- **Accessibility**: Screen reader support and keyboard navigation
- **Themes**: Different visual styles for different battle types

## 📄 License

Part of the AI Rap Battle simulator project. See main project license.
