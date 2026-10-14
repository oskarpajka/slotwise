import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { appointments, clients, services } from "./schema";
import { createTestDatabase, type TestDatabase } from "./test-database";

type Status = (typeof appointments.$inferInsert)["status"];

let testDb: TestDatabase;
let clientId: string;
let serviceId: string;

beforeAll(async () => {
  testDb = await createTestDatabase();
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
  const { db } = testDb;
  await db.delete(appointments);
  await db.delete(clients);
  await db.delete(services);
  const [client] = await db
    .insert(clients)
    .values({ firstName: "Anna", lastName: "Testowa" })
    .returning();
  const [service] = await db
    .insert(services)
    .values({
      name: "Brwi",
      priceGrosze: 12000,
      durationMin: 60,
      color: "#aa5566",
    })
    .returning();
  if (!client || !service) throw new Error("fixture insert failed");
  clientId = client.id;
  serviceId = service.id;
});

function book(startsAt: string, endsAt: string, status: Status = "scheduled") {
  return testDb.db.insert(appointments).values({
    clientId,
    serviceId,
    startsAt: new Date(startsAt),
    endsAt: new Date(endsAt),
    status,
    priceGrosze: 12000,
    durationMin: 60,
  });
}

const NINE = "2026-10-20T09:00:00Z";
const TEN = "2026-10-20T10:00:00Z";
const ELEVEN = "2026-10-20T11:00:00Z";
const HALF_NINE = "2026-10-20T09:30:00Z";
const HALF_TEN = "2026-10-20T10:30:00Z";

describe("no_overlap constraint", () => {
  it("rejects a scheduled appointment that overlaps a scheduled one", async () => {
    await book(NINE, TEN);
    await expect(book(HALF_NINE, HALF_TEN)).rejects.toMatchObject({
      cause: { code: "23P01", constraint: "no_overlap" },
    });
  });

  it("rejects an overlap with a completed appointment", async () => {
    await book(NINE, TEN, "completed");
    await expect(book(HALF_NINE, HALF_TEN)).rejects.toMatchObject({
      cause: { code: "23P01", constraint: "no_overlap" },
    });
  });

  it("rejects an appointment fully inside another", async () => {
    await book(NINE, ELEVEN);
    await expect(book(HALF_NINE, HALF_TEN)).rejects.toMatchObject({
      cause: { code: "23P01" },
    });
  });

  it.each(["cancelled", "no_show"] as const)(
    "does not let a %s appointment block the slot",
    async (status) => {
      await book(NINE, TEN, status);
      await expect(book(NINE, TEN)).resolves.toBeDefined();
    },
  );

  it("allows a cancelled appointment on top of a scheduled one", async () => {
    await book(NINE, TEN);
    await expect(book(NINE, TEN, "cancelled")).resolves.toBeDefined();
  });

  it("rejects moving a cancelled appointment back onto a taken slot", async () => {
    await book(NINE, TEN);
    await book(NINE, TEN, "cancelled");
    await expect(
      testDb.pool.query(
        "UPDATE appointments SET status = 'scheduled' WHERE status = 'cancelled'",
      ),
    ).rejects.toMatchObject({ code: "23P01" });
  });

  it("allows back-to-back appointments", async () => {
    await book(NINE, TEN);
    await expect(book(TEN, ELEVEN)).resolves.toBeDefined();
    await expect(book("2026-10-20T08:00:00Z", NINE)).resolves.toBeDefined();
  });
});

describe("schema types", () => {
  it("stores money as integer grosze", async () => {
    const { rows } = await testDb.pool.query(
      `SELECT data_type FROM information_schema.columns
       WHERE column_name = 'price_grosze' ORDER BY table_name`,
    );
    expect(rows).toEqual([{ data_type: "integer" }, { data_type: "integer" }]);
  });

  it("stores every timestamp as timestamptz", async () => {
    const { rows } = await testDb.pool.query(
      `SELECT table_name, column_name, data_type FROM information_schema.columns
       WHERE table_schema = 'public'
         AND (column_name LIKE '%\\_at')
         AND data_type <> 'timestamp with time zone'`,
    );
    expect(rows).toEqual([]);
  });

  it("rejects an appointment that ends before it starts", async () => {
    await expect(book(TEN, NINE)).rejects.toMatchObject({
      cause: { code: "23514" },
    });
  });

  it("keeps the appointment snapshot when the service changes", async () => {
    await book(NINE, TEN);
    await testDb.db.update(services).set({ priceGrosze: 99900 });
    const [row] = await testDb.db.select().from(appointments);
    expect(row?.priceGrosze).toBe(12000);
  });

  it("erases a client's appointments with the client", async () => {
    await book(NINE, TEN);
    await testDb.db.delete(clients);
    expect(await testDb.db.select().from(appointments)).toEqual([]);
  });
});
