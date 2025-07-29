import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "../src/routes/trpc.js";

describe("tRPC API", () => {
  // Create a caller instance for testing
  const caller = appRouter.createCaller({});

  beforeEach(async () => {
    // Clean up test data if needed
    // You might want to use transactions or test-specific database here
  });

  describe("users.list", () => {
    it("should return array of users", async () => {
      const users = await caller.users.list();
      expect(Array.isArray(users)).toBe(true);
    });
  });

  describe("users.create", () => {
    it("should create a new user", async () => {
      const newUser = {
        email: `test${String(Date.now())}@example.com`,
        name: "Test User",
      };

      const user = await caller.users.create(newUser);
      
      expect(user).toBeDefined();
      expect(user).toMatchObject({
        email: newUser.email,
        name: newUser.name,
      });
      expect(user?.id).toBeDefined();
      expect(user?.createdAt).toBeDefined();
    });

    it("should return error for invalid user data", async () => {
      const invalidUser = {
        email: "invalid-email",
        name: "Test",
      };

      await expect(caller.users.create(invalidUser)).rejects.toThrow();
    });
  });

  describe("users.get", () => {
    it("should return error for non-existent user", async () => {
      await expect(caller.users.get({ id: 999999 })).rejects.toThrow("User not found");
    });

    it("should get an existing user", async () => {
      // First create a user
      const newUser = await caller.users.create({
        email: `gettest${String(Date.now())}@example.com`,
        name: "Get Test",
      });

      // Then get it
      if (!newUser) throw new Error('User creation failed');
      const user = await caller.users.get({ id: newUser.id });
      expect(user.id).toBe(newUser.id);
      expect(user.email).toBe(newUser.email);
    });
  });

  describe("users.update", () => {
    it("should update an existing user", async () => {
      // First create a user
      const newUser = await caller.users.create({
        email: `update${String(Date.now())}@example.com`,
        name: "Original Name",
      });

      // Then update it
      if (!newUser) throw new Error('User creation failed');
      const updatedUser = await caller.users.update({
        id: newUser.id,
        data: {
          name: "Updated Name",
        },
      });

      expect(updatedUser.name).toBe("Updated Name");
      expect(updatedUser.email).toBe(newUser.email);
    });

    it("should return error for non-existent user", async () => {
      await expect(
        caller.users.update({
          id: 999999,
          data: { name: "New Name" },
        })
      ).rejects.toThrow("User not found");
    });
  });

  describe("users.delete", () => {
    it("should delete an existing user", async () => {
      // First create a user
      const newUser = await caller.users.create({
        email: `delete${String(Date.now())}@example.com`,
        name: "To Delete",
      });

      // Then delete it
      if (!newUser) throw new Error('User creation failed');
      const result = await caller.users.delete({ id: newUser.id });
      expect(result.success).toBe(true);

      // Verify it's gone
      await expect(caller.users.get({ id: newUser.id })).rejects.toThrow("User not found");
    });

    it("should return error for non-existent user", async () => {
      await expect(
        caller.users.delete({ id: 999999 })
      ).rejects.toThrow("User not found");
    });
  });
});