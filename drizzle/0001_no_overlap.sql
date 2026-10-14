-- Double-booking guard. Drizzle cannot express EXCLUDE constraints, so this is hand written.
-- tstzrange is half-open [starts_at, ends_at), so back-to-back appointments are allowed.
-- cancelled and no_show appointments do not block a slot.
CREATE EXTENSION IF NOT EXISTS btree_gist;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "no_overlap"
  EXCLUDE USING gist (tstzrange("starts_at", "ends_at") WITH &&)
  WHERE ("status" IN ('scheduled', 'completed'));
