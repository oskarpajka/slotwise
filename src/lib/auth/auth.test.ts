import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { auditLog, users } from "@/db/schema";
import { createTestDatabase, type TestDatabase } from "@/db/test-database";
import { type Auth, createAuth } from "./auth";
import { createOwner } from "./owner";

const BASE_URL = "http://localhost:3000";
const OWNER = {
  email: "owner@example.test",
  password: "correct horse battery",
};

let testDb: TestDatabase;
let auth: Auth;

beforeAll(async () => {
  testDb = await createTestDatabase();
  auth = createAuth(testDb.db, {
    secret: "test-secret-for-vitest-only-0123456789abcdef",
    baseURL: BASE_URL,
  });
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(auditLog);
  await testDb.db.delete(users);
});

function post(path: string, body: unknown, cookie?: string) {
  const headers = new Headers({
    "content-type": "application/json",
    origin: BASE_URL,
  });
  if (cookie) headers.set("cookie", cookie);
  return auth.handler(
    new Request(`${BASE_URL}/api/auth${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }),
  );
}

function get(path: string) {
  return auth.handler(new Request(`${BASE_URL}/api/auth${path}`));
}

function signIn(email: string, password: string) {
  return post("/sign-in/email", { email, password });
}

function sessionCookie(response: Response): string {
  const cookie = response.headers
    .getSetCookie()
    .find((value) => value.includes("session_token="));
  if (!cookie) throw new Error("no session cookie in the response");
  return cookie.split(";")[0] ?? "";
}

async function auditActions() {
  const rows = await testDb.db
    .select({ action: auditLog.action })
    .from(auditLog)
    .orderBy(auditLog.at);
  return rows.map((row) => row.action);
}

describe("createOwner", () => {
  it("creates an owner who can sign in", async () => {
    await expect(createOwner(auth, testDb.db, OWNER)).resolves.toEqual({
      status: "created",
    });
    const response = await signIn(OWNER.email, OWNER.password);
    expect(response.status).toBe(200);
  });

  it("refuses a second owner, even with another email", async () => {
    await createOwner(auth, testDb.db, OWNER);
    await expect(
      createOwner(auth, testDb.db, {
        email: "second@example.test",
        password: OWNER.password,
      }),
    ).resolves.toEqual({ status: "owner_exists" });
    expect(await testDb.db.select().from(users)).toHaveLength(1);
  });

  it("refuses a password under 12 characters and creates nothing", async () => {
    const result = await createOwner(auth, testDb.db, {
      email: OWNER.email,
      password: "elevenchars",
    });
    expect(result.status).toBe("invalid");
    expect(await testDb.db.select().from(users)).toEqual([]);
  });

  it("accepts a password of exactly 12 characters", async () => {
    await expect(
      createOwner(auth, testDb.db, {
        email: OWNER.email,
        password: "twelve chars",
      }),
    ).resolves.toEqual({ status: "created" });
  });

  it("refuses missing env values", async () => {
    const result = await createOwner(auth, testDb.db, {
      email: undefined,
      password: undefined,
    });
    expect(result.status).toBe("invalid");
  });
});

describe("audit log", () => {
  beforeEach(async () => {
    await createOwner(auth, testDb.db, OWNER);
  });

  it("records a successful login", async () => {
    await signIn(OWNER.email, OWNER.password);
    expect(await auditActions()).toEqual(["login_succeeded"]);
  });

  it("records one login_failed row per wrong attempt", async () => {
    const first = await signIn(OWNER.email, "wrong password!");
    const second = await signIn("nobody@example.test", OWNER.password);
    expect([first.status, second.status]).toEqual([401, 401]);
    expect(await auditActions()).toEqual(["login_failed", "login_failed"]);
  });

  it("records a logout when a session ends", async () => {
    const cookie = sessionCookie(await signIn(OWNER.email, OWNER.password));
    const response = await post("/sign-out", {}, cookie);
    expect(response.status).toBe(200);
    expect(await auditActions()).toEqual(["login_succeeded", "logout"]);
  });

  it("records nothing for a sign-out without a session", async () => {
    await post("/sign-out", {});
    expect(await auditActions()).toEqual([]);
  });

  it("stores no email or IP address", async () => {
    await signIn(OWNER.email, "wrong password!");
    await signIn(OWNER.email, OWNER.password);
    const { rows } = await testDb.pool.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'audit_log' ORDER BY ordinal_position`,
    );
    expect(rows.map((row) => row.column_name)).toEqual([
      "id",
      "at",
      "action",
      "entity",
      "entity_id",
    ]);
    const dump = JSON.stringify(await testDb.db.select().from(auditLog));
    expect(dump).not.toContain(OWNER.email);
  });
});

describe("HTTP surface", () => {
  it.each(["/sign-up/email", "/admin/create-user", "/request-password-reset"])(
    "answers 404 on POST %s",
    async (path) => {
      const response = await post(path, {
        email: "intruder@example.test",
        password: OWNER.password,
        name: "Intruder",
      });
      expect(response.status).toBe(404);
      expect(await testDb.db.select().from(users)).toEqual([]);
    },
  );

  it.each(["/admin/list-users", "/get-session", "/ok"])(
    "answers 404 on GET %s",
    async (path) => {
      expect((await get(path)).status).toBe(404);
    },
  );
});
