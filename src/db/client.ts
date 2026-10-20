import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

export function createDatabase(pool: Pool): Database {
  return drizzle({ client: pool, schema });
}

/** Connects to DATABASE_URL. The pool opens connections on first query. */
export function connectDatabase(): { db: Database; pool: Pool } {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.");
  }
  const pool = new Pool({ connectionString });
  return { db: createDatabase(pool), pool };
}
