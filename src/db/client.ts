import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

export function createDatabase(pool: Pool): Database {
  return drizzle({ client: pool, schema });
}

/**
 * Uses DATABASE_URL. The pool connects on the first query, so `next build`
 * can import this without a database.
 */
export function connectDatabase(): { db: Database; pool: Pool } {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  // Without a listener, an idle connection dropped by a Postgres restart
  // crashes the process. The pool replaces the connection on the next query.
  pool.on("error", (error) =>
    console.error("Idle database connection lost", error),
  );
  return { db: createDatabase(pool), pool };
}
