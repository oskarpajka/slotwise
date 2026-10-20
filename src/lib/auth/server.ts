import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { connectDatabase } from "@/db/client";
import { type Auth, createAuth } from "./auth";

let instance: Auth | undefined;

// Created on first use, not on import: `next build` imports every route
// without BETTER_AUTH_SECRET, and Better Auth rejects a missing secret.
export function getAuth(): Auth {
  instance ??= createAuth(connectDatabase().db);
  return instance;
}

export type OwnerSession = NonNullable<
  Awaited<ReturnType<Auth["api"]["getSession"]>>
>;

/** The session from the request cookies, checked against the database. */
export const getSession = cache(async () => {
  // headers() first: during `next build` it ends prerendering before Better
  // Auth is created.
  const requestHeaders = await headers();
  return getAuth().api.getSession({ headers: requestHeaders });
});

/**
 * The real access check. Every page, layout, server action and route handler
 * calls it first. `proxy.ts` only looks for a cookie.
 */
export async function requireOwner(): Promise<OwnerSession> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
