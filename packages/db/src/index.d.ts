import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
export declare const battleStatuses: readonly ["pending", "generating", "completed", "failed"];
export declare const insertBattleSchema: z.ZodObject<{
    aiOne: z.ZodString;
    aiTwo: z.ZodString;
    totalRounds: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    aiOne: string;
    aiTwo: string;
    totalRounds: number;
}, {
    aiOne: string;
    aiTwo: string;
    totalRounds?: number | undefined;
}>;
export declare const updateBattleSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "generating", "completed", "failed"]>>;
    currentRound: z.ZodOptional<z.ZodNumber>;
    winner: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "generating" | "completed" | "failed" | undefined;
    currentRound?: number | undefined;
    winner?: string | undefined;
}, {
    status?: "pending" | "generating" | "completed" | "failed" | undefined;
    currentRound?: number | undefined;
    winner?: string | undefined;
}>;
export declare const insertVerseSchema: z.ZodObject<{
    battleId: z.ZodNumber;
    orderIdx: z.ZodNumber;
    ai: z.ZodString;
    lyrics: z.ZodString;
    audioUrl: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    lrcJson: z.ZodOptional<z.ZodString>;
    murekaJobId: z.ZodOptional<z.ZodString>;
    murekaStatus: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    battleId: number;
    orderIdx: number;
    ai: string;
    lyrics: string;
    audioUrl?: string | undefined;
    duration?: number | undefined;
    lrcJson?: string | undefined;
    murekaJobId?: string | undefined;
    murekaStatus?: string | undefined;
}, {
    battleId: number;
    orderIdx: number;
    ai: string;
    lyrics: string;
    audioUrl?: string | undefined;
    duration?: number | undefined;
    lrcJson?: string | undefined;
    murekaJobId?: string | undefined;
    murekaStatus?: string | undefined;
}>;
export declare const updateVerseSchema: z.ZodObject<{
    lyrics: z.ZodOptional<z.ZodString>;
    audioUrl: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    lrcJson: z.ZodOptional<z.ZodString>;
    murekaJobId: z.ZodOptional<z.ZodString>;
    murekaStatus: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    lyrics?: string | undefined;
    audioUrl?: string | undefined;
    duration?: number | undefined;
    lrcJson?: string | undefined;
    murekaJobId?: string | undefined;
    murekaStatus?: string | undefined;
}, {
    lyrics?: string | undefined;
    audioUrl?: string | undefined;
    duration?: number | undefined;
    lrcJson?: string | undefined;
    murekaJobId?: string | undefined;
    murekaStatus?: string | undefined;
}>;
export type NewBattle = z.infer<typeof insertBattleSchema>;
export type UpdateBattle = z.infer<typeof updateBattleSchema>;
export type NewVerse = z.infer<typeof insertVerseSchema>;
export type UpdateVerse = z.infer<typeof updateVerseSchema>;
export type BattleStatus = typeof battleStatuses[number];
export type { Battle, Verse } from '@prisma/client';
export { DATABASE_URL } from './consts.js';
export declare const prisma: PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare const battleDB: {
    prisma: PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
    createBattle(data: NewBattle): Promise<{
        aiOne: string;
        aiTwo: string;
        totalRounds: number;
        status: string;
        currentRound: number;
        winner: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getBattle(id: number): Promise<{
        aiOne: string;
        aiTwo: string;
        totalRounds: number;
        status: string;
        currentRound: number;
        winner: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updateBattle(id: number, data: UpdateBattle): Promise<{
        aiOne: string;
        aiTwo: string;
        totalRounds: number;
        status: string;
        currentRound: number;
        winner: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createVerse(data: NewVerse): Promise<{
        battleId: number;
        orderIdx: number;
        ai: string;
        lyrics: string;
        audioUrl: string | null;
        duration: number | null;
        lrcJson: string | null;
        murekaJobId: string | null;
        murekaStatus: string | null;
        id: number;
        createdAt: Date;
    }>;
    getVersesByBattle(battleId: number): Promise<{
        battleId: number;
        orderIdx: number;
        ai: string;
        lyrics: string;
        audioUrl: string | null;
        duration: number | null;
        lrcJson: string | null;
        murekaJobId: string | null;
        murekaStatus: string | null;
        id: number;
        createdAt: Date;
    }[]>;
    updateVerse(id: number, data: UpdateVerse): Promise<{
        battleId: number;
        orderIdx: number;
        ai: string;
        lyrics: string;
        audioUrl: string | null;
        duration: number | null;
        lrcJson: string | null;
        murekaJobId: string | null;
        murekaStatus: string | null;
        id: number;
        createdAt: Date;
    }>;
    getBattleWithVerses(id: number): Promise<({
        verses: {
            battleId: number;
            orderIdx: number;
            ai: string;
            lyrics: string;
            audioUrl: string | null;
            duration: number | null;
            lrcJson: string | null;
            murekaJobId: string | null;
            murekaStatus: string | null;
            id: number;
            createdAt: Date;
        }[];
    } & {
        aiOne: string;
        aiTwo: string;
        totalRounds: number;
        status: string;
        currentRound: number;
        winner: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    updateBattleStatus(id: number, status: BattleStatus): Promise<{
        aiOne: string;
        aiTwo: string;
        totalRounds: number;
        status: string;
        currentRound: number;
        winner: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateBattleCurrentRound(id: number, currentRound: number): Promise<{
        aiOne: string;
        aiTwo: string;
        totalRounds: number;
        status: string;
        currentRound: number;
        winner: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getVerse(id: number): Promise<{
        battleId: number;
        orderIdx: number;
        ai: string;
        lyrics: string;
        audioUrl: string | null;
        duration: number | null;
        lrcJson: string | null;
        murekaJobId: string | null;
        murekaStatus: string | null;
        id: number;
        createdAt: Date;
    } | null>;
    disconnect(): Promise<void>;
};
//# sourceMappingURL=index.d.ts.map