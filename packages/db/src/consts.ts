/**
 * Database configuration constants
 * 
 * Note: Database URL is hardcoded to simplify development.
 * The SQLite database file (dev.db) will be created in the db package directory.
 * For tests, vitest.setup.ts overrides this with in-memory databases.
 */

export const DATABASE_URL = "file:./dev.db";
