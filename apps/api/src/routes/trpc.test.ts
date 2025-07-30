import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { appRouter } from './trpc.js';
import { battleDB } from '@repo/db';

describe('tRPC Battle API', () => {
  // Create a caller instance for testing
  const caller = appRouter.createCaller({});

  beforeEach(async () => {
    // Clean up database before each test
    await battleDB.prisma.verse.deleteMany();
    await battleDB.prisma.battle.deleteMany();
  });

  afterAll(async () => {
    await battleDB.disconnect();
  });

  describe('battles.create', () => {
    it('should create a new battle', async () => {
      const newBattle = {
        ai_one: 'CodeRapper',
        ai_two: 'AlgoMC',
        total_rounds: 4,
      };

      const result = await caller.battles.create(newBattle);
      
      expect(result).toBeDefined();
      expect(result.battle_id).toBeDefined();
      expect(typeof result.battle_id).toBe('string');
      expect(result.status).toBe('pending');
      expect(result.ai_one).toBe('CodeRapper');
      expect(result.ai_two).toBe('AlgoMC');
      expect(result.current_round).toBe(0);
      expect(result.total_rounds).toBe(4);

      // Verify it was actually created in the database
      const battleId = parseInt(result.battle_id, 10);
      const battle = await battleDB.getBattle(battleId);
      expect(battle).toBeDefined();
      expect(battle?.aiOne).toBe('CodeRapper');
      expect(battle?.aiTwo).toBe('AlgoMC');
    });

    it('should use default total_rounds when not provided', async () => {
      const newBattle = {
        ai_one: 'CodeRapper',
        ai_two: 'AlgoMC',
      };

      const result = await caller.battles.create(newBattle);
      
      expect(result.total_rounds).toBe(4);
    });

    it('should return error for empty AI names', async () => {
      const invalidBattle = {
        ai_one: '',
        ai_two: 'AlgoMC',
      };

      await expect(caller.battles.create(invalidBattle)).rejects.toThrow();
    });

    it('should return error for invalid total_rounds', async () => {
      const invalidBattle = {
        ai_one: 'CodeRapper',
        ai_two: 'AlgoMC',
        total_rounds: 1, // Too low
      };

      await expect(caller.battles.create(invalidBattle)).rejects.toThrow();
    });

    it('should return error for too many rounds', async () => {
      const invalidBattle = {
        ai_one: 'CodeRapper',
        ai_two: 'AlgoMC',
        total_rounds: 15, // Too high
      };

      await expect(caller.battles.create(invalidBattle)).rejects.toThrow();
    });
  });

  describe('battles.get', () => {
    let battleId: string;

    beforeEach(async () => {
      const battle = await battleDB.createBattle({
        aiOne: 'TestBot',
        aiTwo: 'RhymeAI',
        totalRounds: 4,
      });
      battleId = battle.id.toString();
    });

    it('should get battle by id', async () => {
      const battle = await caller.battles.get({ battle_id: battleId });
      
      expect(battle).toBeDefined();
      expect(battle.battle_id).toBe(battleId);
      expect(battle.ai_one).toBe('TestBot');
      expect(battle.ai_two).toBe('RhymeAI');
      expect(battle.status).toBe('pending');
      expect(battle.current_round).toBe(0);
      expect(battle.total_rounds).toBe(4);
      expect(battle.winner).toBeNull();
      expect(battle.verses).toEqual([]);
      expect(battle.created_at).toBeDefined();
      expect(battle.updated_at).toBeDefined();
    });

    it('should get battle with verses', async () => {
      // Add some verses
      await battleDB.createVerse({
        battleId: parseInt(battleId, 10),
        orderIdx: 0,
        ai: 'TestBot',
        lyrics: 'First verse from TestBot',
      });

      await battleDB.createVerse({
        battleId: parseInt(battleId, 10),
        orderIdx: 1,
        ai: 'RhymeAI',
        lyrics: 'Response from RhymeAI',
        audioUrl: 'https://example.com/audio.mp3',
        lrcJson: JSON.stringify({ timestamps: [{ time: 0, text: 'Response from RhymeAI' }] }),
      });

      const battle = await caller.battles.get({ battle_id: battleId });
      
      expect(battle.verses).toHaveLength(2);
      expect(battle.verses[0]?.order_idx).toBe(0);
      expect(battle.verses[0]?.ai).toBe('TestBot');
      expect(battle.verses[0]?.lyrics).toBe('First verse from TestBot');
      expect(battle.verses[0]?.audio_url).toBeNull();
      expect(battle.verses[0]?.lrc_json).toBeNull();

      expect(battle.verses[1]?.order_idx).toBe(1);
      expect(battle.verses[1]?.ai).toBe('RhymeAI');
      expect(battle.verses[1]?.lyrics).toBe('Response from RhymeAI');
      expect(battle.verses[1]?.audio_url).toBe('https://example.com/audio.mp3');
      expect(battle.verses[1]?.lrc_json).toEqual({ timestamps: [{ time: 0, text: 'Response from RhymeAI' }] });
    });

    it('should return error for non-existent battle', async () => {
      await expect(
        caller.battles.get({ battle_id: '999999' })
      ).rejects.toThrow('Battle not found');
    });

    it('should return error for invalid battle ID format', async () => {
      await expect(
        caller.battles.get({ battle_id: 'invalid-id' })
      ).rejects.toThrow('Invalid battle ID');
    });
  });
});
