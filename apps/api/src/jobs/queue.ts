/**
 * Background Job Queue System
 * 
 * Handles asynchronous generation of verses, lyrics, and audio for battles.
 */

import { battleDB } from '@repo/db';
import { createOpenAIClientFromEnv, generateVersesFromDescription, type Genre } from '@repo/lyrics';
import { createMurekaClientFromEnv, type SongGenerationResponse } from '@repo/mureka';

export interface BattleJobData {
  battleId: number;
}

export interface VerseJobData {
  battleId: number;
  round: number;
  ai: string;
  previousVerses?: string[];
}

/**
 * Simple in-memory job queue for development
 * In production, this would be replaced with Redis/Bull or similar
 */
class JobQueue {
  private jobs: Map<string, any> = new Map();
  private processing = false;
  private murekaLock: Promise<void> = Promise.resolve(); // Mutex for Mureka rate limiting

  async add(jobType: string, data: any): Promise<void> {
    const jobId = `${jobType}-${Date.now()}-${Math.random()}`;
    this.jobs.set(jobId, { type: jobType, data, id: jobId });
    
    console.log(`🎯 Job added: ${jobType}`, { jobId, data });
    
    // Start processing if not already processing
    if (!this.processing) {
      this.process();
    }
  }

  private async process(): Promise<void> {
    this.processing = true;
    
    while (this.jobs.size > 0) {
      const entry = this.jobs.entries().next().value;
      if (!entry) break;
      const [jobId, job] = entry;
      this.jobs.delete(jobId);
      
      try {
        await this.processJob(job);
        console.log(`✅ Job completed: ${job.type}`, { jobId });
      } catch (error) {
        console.error(`❌ Job failed: ${job.type}`, { jobId, error });
      }
    }
    
    this.processing = false;
  }

  private async processJob(job: any): Promise<void> {
    switch (job.type) {
      case 'generateBattle':
        await this.generateBattle(job.data);
        break;
      case 'generateVerse':
        await this.generateVerse(job.data);
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  /**
   * Generate all verses for a battle
   */
  private async generateBattle(data: BattleJobData): Promise<void> {
    const { battleId } = data;
    
    console.log(`🎤 Starting battle generation for battle ${battleId}`);
    
    // Update battle status to generating
    await battleDB.updateBattleStatus(battleId, 'generating');
    
    const battle = await battleDB.getBattleWithVerses(battleId);
    if (!battle) {
      throw new Error(`Battle ${battleId} not found`);
    }

    try {
      // Generate verses for each round, alternating between AIs
      for (let round = 1; round <= battle.totalRounds; round++) {
        console.log(`🎵 Generating round ${round}/${battle.totalRounds}`);
        
        // Determine order (AI One starts first, then alternate)
        const firstAI = round % 2 === 1 ? battle.aiOne : battle.aiTwo;
        const secondAI = round % 2 === 1 ? battle.aiTwo : battle.aiOne;
        
        // Generate first verse of the round
        await this.generateVerse({
          battleId,
          round,
          ai: firstAI,
          previousVerses: battle.verses.map(v => v.lyrics).filter(Boolean),
        });
        
        // Refresh battle data to get the new verse
        const updatedBattle = await battleDB.getBattleWithVerses(battleId);
        
        // Generate second verse of the round
        await this.generateVerse({
          battleId,
          round,
          ai: secondAI,
          previousVerses: updatedBattle?.verses.map(v => v.lyrics).filter(Boolean) || [],
        });
      }
      
      // Update battle status to completed
      await battleDB.updateBattleStatus(battleId, 'completed');
      console.log(`🏆 Battle generation completed for battle ${battleId}`);
      
    } catch (error) {
      console.error(`❌ Battle generation failed for battle ${battleId}:`, error);
      await battleDB.updateBattleStatus(battleId, 'failed');
      throw error;
    }
  }

  /**
   * Mutex helper for sequential Mureka requests
   */
  private async withMurekaLock<T>(fn: () => Promise<T>): Promise<T> {
    const release = this.murekaLock;
    let releaseNext: () => void;
    this.murekaLock = new Promise<void>(res => (releaseNext = res));
    await release;
    try {
      return await fn();
    } finally {
      releaseNext!();
    }
  }

  /**
   * Generate audio for a verse with proper rate limiting and job tracking
   */
  private async generateAudioForVerse(
    verseId: number,
    lyrics: string,
    aiName: string,
    maxRetries = 3
  ): Promise<void> {
    const mureka = createMurekaClientFromEnv();
    let verse = await battleDB.getVerse(verseId);

    // If we crashed earlier and jobId already exists, resume polling
    if (!verse?.murekaJobId) {
      // Initial POST - protected by mutex
      const startJob = async () => {
        return await mureka.generateSong({
          lyrics,
          genre: 'rap' as Genre,
        });
      };

      let resp: SongGenerationResponse | null = null;
      for (let i = 0; i < maxRetries; i++) {
        try {
          resp = await this.withMurekaLock(startJob);
          break;
        } catch (err: any) {
          // 429 -> wait + retry
          if (err.message?.includes('429') && i < maxRetries - 1) {
            const wait = (i + 1) * 5000;
            console.warn(`🔄 429 from Mureka – retrying in ${wait}ms`);
            await new Promise(r => setTimeout(r, wait));
            continue;
          }
          throw err;
        }
      }

      if (!resp) {
        throw new Error('Failed to start Mureka job after retries');
      }

      await battleDB.updateVerse(verseId, {
        murekaJobId: resp.id,
        murekaStatus: resp.status
      });
      verse = { ...verse!, murekaJobId: resp.id };
    }

    // Poll until finished
    const pollOpts = { maxWaitTime: 10 * 60_000, pollInterval: 7_000 };
    let finalStatus: SongGenerationResponse;
    try {
      finalStatus = await mureka.pollSongCompletion(
        verse.murekaJobId!,
        {
          ...pollOpts,
          onProgress: async (s) => {
            await battleDB.updateVerse(verseId, { murekaStatus: s.status });
          }
        }
      );
    } catch (err) {
      await battleDB.updateVerse(verseId, { murekaStatus: 'failed' });
      throw err;
    }

    const audioUrl = finalStatus.choices?.[0]?.url;
    const lyricsData = finalStatus.choices?.[0]?.lyrics_sections;

    await battleDB.updateVerse(verseId, {
      audioUrl,
      lrcJson: lyricsData ? JSON.stringify(lyricsData) : undefined,
      murekaStatus: finalStatus.status
    });

    console.log(`🎵 Audio generated for ${aiName}:`, { verseId, audioUrl });
  }

  /**
   * Generate a single verse (lyrics + audio)
   */
  private async generateVerse(data: VerseJobData): Promise<void> {
    const { battleId, round, ai, previousVerses = [] } = data;
    
    console.log(`🎵 Generating verse for ${ai} in round ${round}`);
    
    try {
      // Get battle info for context
      const battle = await battleDB.getBattleWithVerses(battleId);
      if (!battle) {
        throw new Error(`Battle ${battleId} not found`);
      }
      
      // Calculate order index (2 verses per round)
      const orderIdx = (round - 1) * 2 + (ai === battle.aiOne ? 1 : 2);
      
      // Generate lyrics using OpenAI
      const lyricsClient = createOpenAIClientFromEnv();
      
      // Create context for the AI persona
      const battleContext = `This is a rap battle between ${battle.aiOne} and ${battle.aiTwo}. 
You are ${ai}. Write a fierce, clever rap verse that:
- Showcases ${ai}'s personality and strengths
- Responds to previous verses if any
- Uses wordplay, metaphors, and rhymes
- Is around 8-12 lines long
- Maintains appropriate content (no explicit profanity)`;

      const previousContext = previousVerses.length > 0 
        ? `\n\nPrevious verses in this battle:\n${previousVerses.join('\n---\n')}` 
        : '';

      const lyrics = await generateVersesFromDescription(
        lyricsClient,
        battleContext + previousContext,
        '',
        'rap' as Genre,
        {
          verseCount: 1,
          linesPerVerse: '8-12',
        }
      );

      // Create verse record in database first
      const verse = await battleDB.createVerse({
        battleId,
        orderIdx,
        ai,
        lyrics: lyrics || '',
        audioUrl: undefined, // Will be updated after audio generation
        lrcJson: undefined,
      });

      console.log(`📝 Lyrics generated for ${ai}:`, { verseId: verse.id, length: lyrics?.length });

      // Generate audio using Mureka (with rate limiting)
      await this.generateAudioForVerse(verse.id, lyrics || '', ai);

      // Update battle current round
      await battleDB.updateBattleCurrentRound(battleId, round);
      
    } catch (error) {
      console.error(`❌ Verse generation failed for ${ai} in round ${round}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const jobQueue = new JobQueue();
