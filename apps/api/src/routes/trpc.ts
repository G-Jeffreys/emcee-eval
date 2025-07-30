import { initTRPC } from '@trpc/server';
import { battleDB, insertBattleSchema } from '@repo/db';
import { z } from 'zod';
import { jobQueue } from '../jobs/queue.js';

// Initialize tRPC
const t = initTRPC.create();

// Create router
export const router = t.router;
export const publicProcedure = t.procedure;

// Define the battle router
export const battleRouter = router({
  create: publicProcedure
    .input(z.object({
      ai_one: z.string().min(1).max(100),
      ai_two: z.string().min(1).max(100),
      total_rounds: z.number().min(1).max(2).optional().default(1)
    }))
    .mutation(async ({ input }) => {
      console.log('🎤 Creating new battle:', {
        aiOne: input.ai_one,
        aiTwo: input.ai_two,
        totalRounds: input.total_rounds,
      });

      // Create battle in database
      const battle = await battleDB.createBattle({
        aiOne: input.ai_one,
        aiTwo: input.ai_two,
        totalRounds: input.total_rounds,
      });

      console.log('✅ Battle created:', {
        battleId: battle.id,
        status: battle.status,
      });

      // Start background job to generate verses
      await jobQueue.add('generateBattle', { battleId: battle.id });

      return { 
        battle_id: battle.id.toString(),
        status: battle.status,
        ai_one: battle.aiOne,
        ai_two: battle.aiTwo,
        current_round: battle.currentRound,
        total_rounds: battle.totalRounds,
      };
    }),

  get: publicProcedure
    .input(z.object({ battle_id: z.string() }))
    .query(async ({ input }) => {
      const battleId = parseInt(input.battle_id, 10);
      
      if (isNaN(battleId)) {
        throw new Error('Invalid battle ID');
      }

      console.log('🔍 Getting battle:', { battleId });

      const battleWithVerses = await battleDB.getBattleWithVerses(battleId);

      if (!battleWithVerses) {
        throw new Error('Battle not found');
      }

      // Transform to match expected format
      return {
        battle_id: battleWithVerses.id.toString(),
        ai_one: battleWithVerses.aiOne,
        ai_two: battleWithVerses.aiTwo,
        status: battleWithVerses.status,
        current_round: battleWithVerses.currentRound,
        total_rounds: battleWithVerses.totalRounds,
        winner: battleWithVerses.winner,
        created_at: battleWithVerses.createdAt.toISOString(),
        updated_at: battleWithVerses.updatedAt.toISOString(),
        verses: battleWithVerses.verses
          .filter(verse => verse.audioUrl && verse.duration && verse.lrcJson) // Only include completed verses
          .map(verse => ({
            url: verse.audioUrl!,
            ai: verse.ai,
            duration: verse.duration!,
            lyrics_sections: verse.lrcJson ? JSON.parse(verse.lrcJson) : [],
          })),
      };
    }),
});

// Create the main app router
export const appRouter = router({
  battles: battleRouter,
});

// Export type for client
export type AppRouter = typeof appRouter;
