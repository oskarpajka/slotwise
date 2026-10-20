import { createTestDatabase } from "@/db/test-database";
import { createAuth } from "@/lib/auth/auth";
import { createOwner } from "@/lib/auth/owner";
import { E2E_AUTH_SECRET, E2E_DATABASE, E2E_OWNER } from "./owner";

// The database stays after the run, so the server never loses it mid-test.
// The next run replaces it.
export default async function globalSetup() {
  const testDb = await createTestDatabase(E2E_DATABASE);
  try {
    const auth = createAuth(testDb.db, { secret: E2E_AUTH_SECRET });
    const result = await createOwner(auth, testDb.db, E2E_OWNER);
    if (result.status !== "created") {
      throw new Error(`Could not create the e2e owner: ${result.status}`);
    }
  } finally {
    await testDb.pool.end();
  }
}
