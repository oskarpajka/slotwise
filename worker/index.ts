import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1"
import { clients } from "./db/schema";

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => c.json({ ok: true }))

app.get('/api/clients', async (c) => {
    const db = drizzle(c.env.DB)
    const answer = await db.select().from(clients)
    return c.json(answer)
})

export default app