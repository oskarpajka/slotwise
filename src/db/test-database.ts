import { randomBytes } from "node:crypto";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "./schema";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export type TestDatabase = {
  db: ReturnType<typeof createDrizzle>;
  pool: Pool;
  close: () => Promise<void>;
};

function createDrizzle(pool: Pool) {
  return drizzle({ client: pool, schema });
}

/**
 * Creates a throwaway database on the local dev Postgres, applies every
 * committed migration to it, and drops it on close. Refuses non-local hosts.
 */
export async function createTestDatabase(): Promise<TestDatabase> {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.");
  }
  const url = new URL(baseUrl);
  if (!LOCAL_HOSTS.has(url.hostname)) {
    throw new Error(
      `Refusing to run tests against non-local host "${url.hostname}".`,
    );
  }

  const name = `slotwise_test_${randomBytes(6).toString("hex")}`;
  const admin = new Pool({ connectionString: baseUrl, max: 1 });
  try {
    await admin.query(`CREATE DATABASE "${name}"`);
  } catch (error) {
    await admin.end();
    throw new Error(
      "Cannot reach the local Postgres. Run `docker compose up -d --wait`.",
      { cause: error },
    );
  }

  url.pathname = `/${name}`;
  const pool = new Pool({ connectionString: url.toString(), max: 4 });
  const db = createDrizzle(pool);

  const close = async () => {
    await pool.end();
    await admin.query(`DROP DATABASE "${name}" WITH (FORCE)`);
    await admin.end();
  };

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
  } catch (error) {
    await close();
    throw error;
  }

  return { db, pool, close };
}
