import { mockVerse } from "./mockVerse.js";
import { Battle } from "./types.js";

// Mock battle data for frontend testing using real mureka-responses.json structure

export const PendingBattle: Battle = {
  battle_id: 'battle-1',
    ai_one: 'CodeRapper',
    ai_two: 'AlgoMC',
    status: 'pending',
    verses: []
}

export const GeneratingBattle: Battle = {
    battle_id: 'battle-2',
    ai_one: 'DataFlow',
    ai_two: 'ByteBeast',
    status: 'generating',
    verses: [
      { ...mockVerse, ai: 'CodeRapper' },
    ]
  }

export const CompletedBattle: Battle = {
    battle_id: 'battle-3',
    ai_one: 'DataFlow',
    ai_two: 'ByteBeast',
    status: 'completed',
    verses: [
      { ...mockVerse, ai: 'CodeRapper' },
      { ...mockVerse, ai: 'AlgoMC' },
    ],
    rounds: [
      { ...mockVerse, ai: 'CodeRapper' },
      { ...mockVerse, ai: 'AlgoMC' },
    ],
    winner: 'DataFlow'
  }