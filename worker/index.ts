import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1"
import { clients } from "./db/schema";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono<{ Bindings: Env }>()

const createClientSchema = z.object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    phone: z.string().trim().max(20).transform((value) => (value === '' ?  null : value)).optional(),
    notes: z.string().trim().max(2000).transform((value) => (value === '' ?  null : value)).optional()
})

app.get('/api/health', (c) => c.json({ ok: true }))

app.get('/api/clients', async (c) => {
    const db = drizzle(c.env.DB)
    const answer = await db.select().from(clients)
    return c.json(answer)
})

app.post('/api/clients', zValidator('json', createClientSchema), async (c) => {
    const data = c.req.valid('json')
    const db = drizzle(c.env.DB)
    const [newClient] = await db.insert(clients).values(data).returning()
    return c.json(newClient, 201)
})

export default app