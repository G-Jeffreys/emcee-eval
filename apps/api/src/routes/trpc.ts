import { initTRPC } from '@trpc/server';
import { db, users, insertUserSchema, updateUserSchema, eq } from '@repo/db';
import { z } from 'zod';

// Initialize tRPC
const t = initTRPC.create();

// Create router
export const router = t.router;
export const publicProcedure = t.procedure;

// Define the user router
export const userRouter = router({
  list: publicProcedure
    .query(async () => {
      const allUsers = await db.select().from(users);
      return allUsers;
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [user] = await db.select().from(users).where(eq(users.id, input.id)).limit(1);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }),

  create: publicProcedure
    .input(insertUserSchema)
    .mutation(async ({ input }) => {
      const [newUser] = await db.insert(users).values(input).returning();
      return newUser;
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      data: updateUserSchema,
    }))
    .mutation(async ({ input }) => {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.id))
        .returning();
      if (!updatedUser) {
        throw new Error('User not found');
      }
      return updatedUser;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const deletedUser = await db.delete(users).where(eq(users.id, input.id)).returning();
      if (deletedUser.length === 0) {
        throw new Error('User not found');
      }
      return { success: true };
    }),
});

// Create the main app router
export const appRouter = router({
  users: userRouter,
});

// Export type for client
export type AppRouter = typeof appRouter;