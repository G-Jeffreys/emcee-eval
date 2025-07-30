import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
// Battle status enum
export const battleStatuses = ['pending', 'generating', 'completed', 'failed'];
// Zod schemas for validation
export const insertBattleSchema = z.object({
    aiOne: z.string().min(1).max(100),
    aiTwo: z.string().min(1).max(100),
    totalRounds: z.number().min(1).max(1).optional().default(1),
});
export const updateBattleSchema = z.object({
    status: z.enum(battleStatuses).optional(),
    currentRound: z.number().min(0).optional(),
    winner: z.string().optional(),
});
export const insertVerseSchema = z.object({
    battleId: z.number(),
    orderIdx: z.number().min(0),
    ai: z.string().min(1),
    lyrics: z.string().min(1),
    audioUrl: z.string().url().optional(),
    duration: z.number().optional(),
    lrcJson: z.string().optional(),
    murekaJobId: z.string().optional(),
    murekaStatus: z.string().optional(),
});
export const updateVerseSchema = z.object({
    lyrics: z.string().optional(),
    audioUrl: z.string().url().optional(),
    duration: z.number().optional(),
    lrcJson: z.string().optional(),
    murekaJobId: z.string().optional(),
    murekaStatus: z.string().optional(),
});
// Export constants
export { DATABASE_URL } from './consts.js';
// Create Prisma client
export const prisma = new PrismaClient();
// Database operations
export const battleDB = {
    // Expose prisma client for advanced operations
    prisma,
    // Battle operations
    async createBattle(data) {
        return await prisma.battle.create({
            data: {
                aiOne: data.aiOne,
                aiTwo: data.aiTwo,
                totalRounds: data.totalRounds,
                status: 'pending',
                currentRound: 0,
            },
        });
    },
    async getBattle(id) {
        return await prisma.battle.findUnique({
            where: { id },
        });
    },
    async updateBattle(id, data) {
        return await prisma.battle.update({
            where: { id },
            data: {
                ...(data.status && { status: data.status }),
                ...(data.currentRound !== undefined && { currentRound: data.currentRound }),
                ...(data.winner && { winner: data.winner }),
            },
        });
    },
    // Verse operations
    async createVerse(data) {
        return await prisma.verse.create({
            data: {
                battleId: data.battleId,
                orderIdx: data.orderIdx,
                ai: data.ai,
                lyrics: data.lyrics,
                audioUrl: data.audioUrl || null,
                duration: data.duration || null,
                lrcJson: data.lrcJson || null,
                murekaJobId: data.murekaJobId || null,
                murekaStatus: data.murekaStatus || null,
            },
        });
    },
    async getVersesByBattle(battleId) {
        return await prisma.verse.findMany({
            where: { battleId },
            orderBy: { orderIdx: 'asc' },
        });
    },
    async updateVerse(id, data) {
        return await prisma.verse.update({
            where: { id },
            data: {
                ...(data.lyrics && { lyrics: data.lyrics }),
                ...(data.audioUrl !== undefined && { audioUrl: data.audioUrl }),
                ...(data.duration !== undefined && { duration: data.duration }),
                ...(data.lrcJson !== undefined && { lrcJson: data.lrcJson }),
                ...(data.murekaJobId !== undefined && { murekaJobId: data.murekaJobId }),
                ...(data.murekaStatus !== undefined && { murekaStatus: data.murekaStatus }),
            },
        });
    },
    // Get battle with verses
    async getBattleWithVerses(id) {
        return await prisma.battle.findUnique({
            where: { id },
            include: {
                verses: {
                    orderBy: { orderIdx: 'asc' },
                },
            },
        });
    },
    // Update battle status
    async updateBattleStatus(id, status) {
        return await this.updateBattle(id, { status });
    },
    // Update battle current round
    async updateBattleCurrentRound(id, currentRound) {
        return await this.updateBattle(id, { currentRound });
    },
    // Get a single verse by ID
    async getVerse(id) {
        return await prisma.verse.findUnique({
            where: { id },
        });
    },
    // Utility to close database connection (for tests)
    async disconnect() {
        await prisma.$disconnect();
    },
};
