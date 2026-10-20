import { z } from "zod";
import type { Database } from "@/db/client";
import { users } from "@/db/schema";
import type { Auth } from "./auth";
import { passwordSchema } from "./password";

const ownerInput = z.object({
  email: z.email(),
  password: passwordSchema,
});

export type CreateOwnerResult =
  | { status: "created" }
  | { status: "owner_exists" }
  | { status: "invalid"; issues: string[] };

/**
 * Creates the one owner account. Refuses when any account already exists,
 * because Slotwise has exactly one owner.
 */
export async function createOwner(
  auth: Auth,
  db: Database,
  input: { email: string | undefined; password: string | undefined },
): Promise<CreateOwnerResult> {
  const parsed = ownerInput.safeParse(input);
  if (!parsed.success) {
    return {
      status: "invalid",
      issues: parsed.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      ),
    };
  }

  const [existing] = await db.select({ id: users.id }).from(users).limit(1);
  if (existing) return { status: "owner_exists" };

  // No request headers: the admin plugin allows this only from the server.
  await auth.api.createUser({
    body: { ...parsed.data, name: "Owner" },
  });
  return { status: "created" };
}
