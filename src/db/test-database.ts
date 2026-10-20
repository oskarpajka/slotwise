import { randomBytes } from "node:crypto";
import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { createDatabase, type Database } from "./client";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export type TestDatabase = {
  db: Database;
  pool: Pool;
  close: () => Promise<void>;
};

function localBaseUrl(): URL {
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
  return url;
}

/** The URL of database `name` on the local dev Postgres. */
export function testDatabaseUrl(name: string): string {
  const url = localBaseUrl();
  url.pathname = `/${name}`;
  return url.toString();
}

/**
 * Creates a throwaway database on the local dev Postgres, applies every
 * committed migration to it, and drops it on close. Refuses non-local hosts.
 * A database left behind under the same name by a crashed run is replaced.
 */
export async function createTestDatabase(
  name = `slotwise_test_${randomBytes(6).toString("hex")}`,
): Promise<TestDatabase> {
  const admin = new Pool({
    connectionString: localBaseUrl().toString(),
    max: 1,
  });
  try {
    await admin.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    await admin.query(`CREATE DATABASE "${name}"`);
  } catch (error) {
    await admin.end();
    throw new Error(
      "Cannot reach the local Postgres. Run `docker compose up -d --wait`.",
      { cause: error },
    );
  }

  const pool = new Pool({ connectionString: testDatabaseUrl(name), max: 4 });
  const db = createDatabase(pool);

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
