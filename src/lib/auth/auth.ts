import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import type { Database } from "@/db/client";
import { accounts, sessions, users, verifications } from "@/db/schema";
import { recordAuditEvent } from "@/lib/audit-log";
import { exposeOnly } from "./expose-only";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "./password";

const DAY_SECONDS = 60 * 60 * 24;

/**
 * The only Better Auth paths reachable over HTTP (ADR 0002). Everything else,
 * sign-up and the admin plugin included, answers 404. Server-side `auth.api`
 * calls are not affected.
 */
export const EXPOSED_AUTH_PATHS = ["/sign-in/email", "/sign-out"] as const;

type AuthConfig = {
  /** Defaults to the BETTER_AUTH_SECRET env var. */
  secret?: string;
  /** Defaults to the BETTER_AUTH_URL env var. */
  baseURL?: string;
};

export function createAuth(db: Database, config: AuthConfig = {}) {
  return betterAuth({
    ...config,
    database: drizzleAdapter(db, {
      provider: "pg",
      usePlural: true,
      schema: { users, sessions, accounts, verifications },
    }),
    advanced: { database: { generateId: "uuid" } },
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
    },
    session: { expiresIn: 7 * DAY_SECONDS, updateAge: DAY_SECONDS },
    // Turned on, behind Caddy's X-Real-IP, in ticket #17.
    rateLimit: { enabled: false },
    hooks: {
      after: createAuthMiddleware(async (ctx) => {
        if (ctx.path === "/sign-in/email") {
          await recordAuditEvent(
            db,
            ctx.context.newSession ? "login_succeeded" : "login_failed",
          );
        }
      }),
    },
    databaseHooks: {
      session: {
        delete: {
          // Runs only when a session row existed, so a sign-out without a
          // valid session writes nothing.
          after: async (_session, ctx) => {
            if (ctx?.path === "/sign-out") await recordAuditEvent(db, "logout");
          },
        },
      },
    },
    // nextCookies must stay last.
    plugins: [exposeOnly(EXPOSED_AUTH_PATHS), admin(), nextCookies()],
  });
}

export type Auth = ReturnType<typeof createAuth>;
