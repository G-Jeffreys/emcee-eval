import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { battleDB } from './index.js';
describe('BattleDB', () => {
    beforeEach(async () => {
        // Clean up database before each test
        await battleDB.prisma.verse.deleteMany();
        await battleDB.prisma.battle.deleteMany();
    });
    afterAll(async () => {
        await battleDB.disconnect();
    });
    describe('Battle operations', () => {
        it('should create a battle', async () => {
            const battleData = {
                aiOne: 'RapBot',
                aiTwo: 'LyricMaster',
                totalRounds: 4,
            };
            const battle = await battleDB.createBattle(battleData);
            expect(battle).toBeDefined();
            expect(battle.id).toBeTypeOf('number');
            expect(battle.aiOne).toBe('RapBot');
            expect(battle.aiTwo).toBe('LyricMaster');
            expect(battle.status).toBe('pending');
            expect(battle.currentRound).toBe(0);
            expect(battle.totalRounds).toBe(4);
            expect(battle.winner).toBeNull();
            expect(battle.createdAt).toBeInstanceOf(Date);
            expect(battle.updatedAt).toBeInstanceOf(Date);
        });
        it('should get a battle by id', async () => {
            const battleData = {
                aiOne: 'RapBot',
                aiTwo: 'LyricMaster',
                totalRounds: 4,
            };
            const createdBattle = await battleDB.createBattle(battleData);
            const retrievedBattle = await battleDB.getBattle(createdBattle.id);
            expect(retrievedBattle).toBeDefined();
            expect(retrievedBattle?.id).toBe(createdBattle.id);
            expect(retrievedBattle?.aiOne).toBe('RapBot');
            expect(retrievedBattle?.aiTwo).toBe('LyricMaster');
        });
        it('should return null for non-existent battle', async () => {
            const battle = await battleDB.getBattle(999);
            expect(battle).toBeNull();
        });
        it('should update battle status', async () => {
            const battleData = {
                aiOne: 'RapBot',
                aiTwo: 'LyricMaster',
                totalRounds: 4,
            };
            const battle = await battleDB.createBattle(battleData);
            const updatedBattle = await battleDB.updateBattle(battle.id, {
                status: 'generating',
                currentRound: 1,
            });
            expect(updatedBattle).toBeDefined();
            expect(updatedBattle.status).toBe('generating');
            expect(updatedBattle.currentRound).toBe(1);
            expect(updatedBattle.updatedAt.getTime()).toBeGreaterThanOrEqual(battle.updatedAt.getTime());
        });
        it('should update battle winner', async () => {
            const battleData = {
                aiOne: 'RapBot',
                aiTwo: 'LyricMaster',
                totalRounds: 4,
            };
            const battle = await battleDB.createBattle(battleData);
            const updatedBattle = await battleDB.updateBattle(battle.id, {
                status: 'completed',
                winner: 'RapBot',
            });
            expect(updatedBattle).toBeDefined();
            expect(updatedBattle.status).toBe('completed');
            expect(updatedBattle.winner).toBe('RapBot');
        });
    });
    describe('Verse operations', () => {
        let battleId;
        beforeEach(async () => {
            const battle = await battleDB.createBattle({
                aiOne: 'RapBot',
                aiTwo: 'LyricMaster',
                totalRounds: 4,
            });
            battleId = battle.id;
        });
        it('should create a verse', async () => {
            const verseData = {
                battleId,
                orderIdx: 0,
                ai: 'RapBot',
                lyrics: 'Yo, I\'m the rap bot, spitting fire code\nAlgorithms in my flow, that\'s how I roll',
            };
            const verse = await battleDB.createVerse(verseData);
            expect(verse).toBeDefined();
            expect(verse.id).toBeTypeOf('number');
            expect(verse.battleId).toBe(battleId);
            expect(verse.orderIdx).toBe(0);
            expect(verse.ai).toBe('RapBot');
            expect(verse.lyrics).toBe(verseData.lyrics);
            expect(verse.audioUrl).toBeNull();
            expect(verse.lrcJson).toBeNull();
            expect(verse.createdAt).toBeInstanceOf(Date);
        });
        it('should create verse with audio URL and LRC data', async () => {
            const verseData = {
                battleId,
                orderIdx: 0,
                ai: 'RapBot',
                lyrics: 'Test lyrics',
                audioUrl: 'https://example.com/audio.mp3',
                lrcJson: JSON.stringify({ timestamps: [] }),
            };
            const verse = await battleDB.createVerse(verseData);
            expect(verse.audioUrl).toBe('https://example.com/audio.mp3');
            expect(verse.lrcJson).toBe(JSON.stringify({ timestamps: [] }));
        });
        it('should get verses by battle id', async () => {
            const verse1Data = {
                battleId,
                orderIdx: 0,
                ai: 'RapBot',
                lyrics: 'First verse',
            };
            const verse2Data = {
                battleId,
                orderIdx: 1,
                ai: 'LyricMaster',
                lyrics: 'Second verse',
            };
            await battleDB.createVerse(verse1Data);
            await battleDB.createVerse(verse2Data);
            const verses = await battleDB.getVersesByBattle(battleId);
            expect(verses).toHaveLength(2);
            expect(verses[0]?.orderIdx).toBe(0);
            expect(verses[0]?.ai).toBe('RapBot');
            expect(verses[1]?.orderIdx).toBe(1);
            expect(verses[1]?.ai).toBe('LyricMaster');
        });
        it('should update verse with audio URL', async () => {
            const verse = await battleDB.createVerse({
                battleId,
                orderIdx: 0,
                ai: 'RapBot',
                lyrics: 'Test lyrics',
            });
            const updatedVerse = await battleDB.updateVerse(verse.id, {
                audioUrl: 'https://example.com/audio.mp3',
                lrcJson: JSON.stringify({ timestamps: [] }),
            });
            expect(updatedVerse).toBeDefined();
            expect(updatedVerse.audioUrl).toBe('https://example.com/audio.mp3');
            expect(updatedVerse.lrcJson).toBe(JSON.stringify({ timestamps: [] }));
        });
        it('should get battle with verses', async () => {
            await battleDB.createVerse({
                battleId,
                orderIdx: 0,
                ai: 'RapBot',
                lyrics: 'First verse',
            });
            await battleDB.createVerse({
                battleId,
                orderIdx: 1,
                ai: 'LyricMaster',
                lyrics: 'Second verse',
            });
            const battleWithVerses = await battleDB.getBattleWithVerses(battleId);
            expect(battleWithVerses).toBeDefined();
            expect(battleWithVerses?.id).toBe(battleId);
            expect(battleWithVerses?.verses).toHaveLength(2);
            expect(battleWithVerses?.verses[0]?.lyrics).toBe('First verse');
            expect(battleWithVerses?.verses[1]?.lyrics).toBe('Second verse');
        });
    });
    describe('Data validation', () => {
        it('should enforce unique constraint on battle_id and order_idx', async () => {
            const battle = await battleDB.createBattle({
                aiOne: 'RapBot',
                aiTwo: 'LyricMaster',
                totalRounds: 4,
            });
            await battleDB.createVerse({
                battleId: battle.id,
                orderIdx: 0,
                ai: 'RapBot',
                lyrics: 'First verse',
            });
            // This should throw due to unique constraint
            await expect(battleDB.createVerse({
                battleId: battle.id,
                orderIdx: 0,
                ai: 'LyricMaster',
                lyrics: 'Duplicate verse',
            })).rejects.toThrow();
        });
    });
});
