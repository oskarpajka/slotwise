import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const appointmentStatus = pgEnum("appointment_status", [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
]);

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  // E.164. Optional and not unique: two clients may share a number.
  phoneE164: text("phone_e164"),
  email: text("email"),
  notes: text("notes"),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  smsOptOut: boolean("sms_opt_out").notNull().default(false),
  // Ciphertext only. Encrypted in the application, key never in the database.
  healthInfo: text("health_info"),
  healthConsentAt: timestamp("health_consent_at", {
    withTimezone: true,
    mode: "date",
  }),
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    // Integer grosze: 12000 = 120,00 zl.
    priceGrosze: integer("price_grosze").notNull(),
    durationMin: integer("duration_min").notNull(),
    color: text("color").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [
    check("services_price_grosze_nonneg", sql`${t.priceGrosze} >= 0`),
    check("services_duration_min_positive", sql`${t.durationMin} > 0`),
  ],
);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Erasing a client erases their appointments (RODO).
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    // A used service is never hard-deleted.
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "restrict" }),
    startsAt: timestamp("starts_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    endsAt: timestamp("ends_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    status: appointmentStatus("status").notNull().default("scheduled"),
    // Snapshots of the service at booking time.
    priceGrosze: integer("price_grosze").notNull(),
    durationMin: integer("duration_min").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check("appointments_ends_after_starts", sql`${t.endsAt} > ${t.startsAt}`),
    check("appointments_price_grosze_nonneg", sql`${t.priceGrosze} >= 0`),
    check("appointments_duration_min_positive", sql`${t.durationMin} > 0`),
    index("appointments_client_id_idx").on(t.clientId),
    index("appointments_starts_at_idx").on(t.startsAt),
    // The no_overlap exclusion constraint lives in a custom migration:
    // Drizzle cannot express EXCLUDE USING gist.
  ],
);
