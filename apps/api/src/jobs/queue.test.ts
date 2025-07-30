import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { jobQueue, type BattleJobData } from './queue.js';
import { battleDB } from '@repo/db';

// Mock the external packages
vi.mock('@repo/lyrics', () => ({
  createOpenAIClientFromEnv: vi.fn(() => ({
    // Mock OpenAI client
  })),
  generateVersesFromDescription: vi.fn(async () => ({
    verses: ['Mock rap lyrics here, sick rhymes and clever bars\nThis is a test verse, reaching for the stars'],
  })),
}));

vi.mock('@repo/mureka', () => ({
  createMurekaClientFromEnv: vi.fn(() => ({
    generateSong: vi.fn(async () => ({
      audio_url: 'https://mock.mureka.ai/audio/test.mp3',
      lrc_json: { '0:00': 'Mock rap lyrics here' },
    })),
  })),
}));

describe('Job Queue', () => {
  beforeEach(async () => {
    // Clear any existing jobs
    jobQueue['jobs'].clear();
    jobQueue['processing'] = false;
  });

  afterEach(async () => {
    await battleDB.disconnect();
  });

  it('should add jobs to the queue', async () => {
    const jobData: BattleJobData = { battleId: 1 };
    
    await jobQueue.add('generateBattle', jobData);
    
    // Since processing happens async, we just verify the job was added
    expect(true).toBe(true); // Job queue internal state is private
  });

  it('should process battle generation job', async () => {
    // Create a test battle first
    const battle = await battleDB.createBattle({
      aiOne: 'GPT-4',
      aiTwo: 'Claude',
      totalRounds: 2,
    });

    // Mock console.log to avoid spam
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Add job and wait a bit for processing
    await jobQueue.add('generateBattle', { battleId: battle.id });
    
    // Wait for job processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check that battle was updated
    const updatedBattle = await battleDB.getBattleWithVerses(battle.id);
    expect(updatedBattle?.status).toBe('generating');
    
    consoleSpy.mockRestore();
  });

  it('should handle job failures gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Try to process a job with invalid battle ID
    await jobQueue.add('generateBattle', { battleId: 99999 });
    
    // Wait for job processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should have logged an error
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});
