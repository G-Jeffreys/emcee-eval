import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "../src/routes/trpc.js";

describe("tRPC Battle API", () => {
  // Create a caller instance for testing
  const caller = appRouter.createCaller({});

  beforeEach(async () => {
    // Clean up test data if needed
  });

  describe("battles.create", () => {
    it("should create a new battle", async () => {
      const newBattle = {
        ai_one: "CodeRapper",
        ai_two: "AlgoMC",
      };

      const result = await caller.battles.create(newBattle);
      
      expect(result).toBeDefined();
      expect(result.battle_id).toBeDefined();
      expect(typeof result.battle_id).toBe("string");
      // Should return one of the mock battle IDs
      expect(["battle-1", "battle-2", "battle-3"]).toContain(result.battle_id);
    });

    it("should return error for empty AI names", async () => {
      const invalidBattle = {
        ai_one: "",
        ai_two: "AlgoMC",
      };

      await expect(caller.battles.create(invalidBattle)).rejects.toThrow();
    });

    it("should return error for missing AI names", async () => {
      const invalidBattle = {
        ai_one: "CodeRapper",
        ai_two: "",
      };

      await expect(caller.battles.create(invalidBattle)).rejects.toThrow();
    });
  });

  describe("battles.get", () => {
    it("should get battle-1 (pending battle)", async () => {
      const battle = await caller.battles.get({ battle_id: "battle-1" });
      
      expect(battle).toBeDefined();
      expect(battle.battle_id).toBe("battle-1");
      expect(battle.status).toBe("pending");
      expect(battle.ai_one).toBeDefined();
      expect(battle.ai_two).toBeDefined();
    });

    it("should get battle-2 (generating battle)", async () => {
      const battle = await caller.battles.get({ battle_id: "battle-2" });
      
      expect(battle).toBeDefined();
      expect(battle.battle_id).toBe("battle-2");
      expect(battle.status).toBe("generating");
      expect(battle.ai_one).toBeDefined();
      expect(battle.ai_two).toBeDefined();
    });

    it("should get battle-3 (completed battle)", async () => {
      const battle = await caller.battles.get({ battle_id: "battle-3" });
      
      expect(battle).toBeDefined();
      expect(battle.battle_id).toBe("battle-3");
      expect(battle.status).toBe("completed");
      expect(battle.ai_one).toBeDefined();
      expect(battle.ai_two).toBeDefined();
      expect(battle.verses).toBeDefined();
      expect(Array.isArray(battle.verses)).toBe(true);
      expect(battle.winner).toBeDefined();
    });

    it("should return error for non-existent battle", async () => {
      await expect(
        caller.battles.get({ battle_id: "non-existent-battle" })
      ).rejects.toThrow("Battle not found");
    });

    it("should return error for empty battle ID", async () => {
      await expect(
        caller.battles.get({ battle_id: "" })
      ).rejects.toThrow();
    });
  });
});
