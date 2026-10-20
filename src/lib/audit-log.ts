import type { Database } from "@/db/client";
import { type auditAction, auditLog } from "@/db/schema";

export type AuditAction = (typeof auditAction.enumValues)[number];

export async function recordAuditEvent(
  db: Database,
  action: AuditAction,
): Promise<void> {
  await db.insert(auditLog).values({ action });
}
