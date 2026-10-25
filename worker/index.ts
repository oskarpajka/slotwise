import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => c.json({ ok: true }))

app.get('/api/db-check', async (c) => {
    const result = await c.env.DB.prepare('SELECT 1 AS one').first()
    return c.json(result)
})

export default app