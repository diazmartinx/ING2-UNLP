// src/db.ts
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
// Import your schema definition(s) here
import * as schema from './schema'; // Assuming your schema is in src/schema.ts

// Variable to hold the singleton instance
let _db: DrizzleD1Database<typeof schema> | null = null;

/**
 * Initializes and/or returns the Drizzle DB instance.
 * Ensures that drizzle() is only called once per worker instance.
 * @param d1Binding - The D1Database instance from the Cloudflare environment.
 * @returns The initialized Drizzle D1 Database instance.
 */
export function getDb(d1Binding: D1Database): DrizzleD1Database<typeof schema> {
  if (!_db) {
    console.log("Initializing Drizzle DB instance for D1..."); // Log to see when it runs
    _db = drizzle(d1Binding, { schema });
  }
  return _db;
}

// Optional: Export the type for convenience elsewhere
export type DbType = DrizzleD1Database<typeof schema>;