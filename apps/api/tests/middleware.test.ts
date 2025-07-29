import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index.js";

describe("Express Middleware - JSON Body Parsing", () => {
  it("should parse JSON body for tRPC battle.create requests", async () => {
    const battleData = {
      ai_one: "TestRapper",
      ai_two: "TestMC",
    };

    const response = await request(app)
      .post("/api/trpc/battles.create")
      .send(battleData)
      .set("Content-Type", "application/json")
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.result).toBeDefined();
    expect(response.body.result.data).toBeDefined();
    expect(response.body.result.data.battle_id).toBeDefined();
    expect(typeof response.body.result.data.battle_id).toBe("string");
  });

  it("should reject requests with invalid JSON body structure", async () => {
    const invalidData = {
      ai_one: "", // Empty string should fail validation
      ai_two: "TestMC",
    };

    const response = await request(app)
      .post("/api/trpc/battles.create")
      .send(invalidData)
      .set("Content-Type", "application/json")
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  it("should reject requests with missing required fields", async () => {
    const incompleteData = {
      ai_one: "TestRapper",
      // missing ai_two
    };

    const response = await request(app)
      .post("/api/trpc/battles.create")
      .send(incompleteData)
      .set("Content-Type", "application/json")
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  it("should handle completely missing JSON body", async () => {
    const response = await request(app)
      .post("/api/trpc/battles.create")
      .set("Content-Type", "application/json")
      // No body sent
      .expect(400);

    expect(response.body.error).toBeDefined();
    // Should get the "Required" error that was originally failing
    expect(response.body.error.message).toContain("Required");
  });

  it("should handle malformed JSON", async () => {
    const response = await request(app)
      .post("/api/trpc/battles.create")
      .send("{ invalid json")
      .set("Content-Type", "application/json")
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  it("should handle tRPC batch requests", async () => {
    // tRPC often sends batch requests in this format
    const batchData = [
      {
        id: 0,
        jsonrpc: "2.0",
        method: "battles.create",
        params: {
          input: {
            ai_one: "BatchRapper",
            ai_two: "BatchMC",
          },
        },
      },
    ];

    const response = await request(app)
      .post("/api/trpc")
      .send(batchData)
      .set("Content-Type", "application/json");

    // Should be able to parse the JSON (status may vary based on tRPC batch handling)
    expect(response.status).not.toBe(400); // At least not a JSON parsing error
  });

  it("should handle URL-encoded data as well", async () => {
    const response = await request(app)
      .post("/health")
      .send("test=data")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .expect(200);

    expect(response.body.status).toBe("ok");
  });
});

describe("tRPC Integration - Full Request Cycle", () => {
  it("should successfully create and retrieve a battle", async () => {
    // Step 1: Create a battle
    const createData = {
      ai_one: "IntegrationRapper",
      ai_two: "IntegrationMC",
    };

    const createResponse = await request(app)
      .post("/api/trpc/battles.create")
      .send(createData)
      .set("Content-Type", "application/json")
      .expect(200);

    const battleId = createResponse.body.result.data.battle_id;
    expect(battleId).toBeDefined();

    // Step 2: Retrieve the battle (this uses query params, not JSON body)
    const getResponse = await request(app)
      .get(`/api/trpc/battles.get?input=${encodeURIComponent(JSON.stringify({ battle_id: battleId }))}`)
      .expect(200);

    const battleData = getResponse.body.result.data;
    expect(battleData).toBeDefined();
    expect(battleData.battle_id).toBe(battleId);
  });
});
