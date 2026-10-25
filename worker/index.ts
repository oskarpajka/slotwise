import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { clients } from './db/schema'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => c.json({ ok: true }))

// Schemas
const createClientSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z
    .string()
    .trim()
    .max(20)
    .transform((value) => (value === '' ? null : value))
    .optional(),
  notes: z
    .string()
    .trim()
    .max(2000)
    .transform((value) => (value === '' ? null : value))
    .optional(),
})

const idParamSchema = z.object({ id: z.coerce.number().int().positive() })
const updateClientSchema = createClientSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Send at least one field to update',
  })

// Get all clients and their data
app.get('/api/clients', async (c) => {
  const db = drizzle(c.env.DB)
  const answer = await db.select().from(clients)
  return c.json(answer)
})

// Add a client
app.post('/api/clients', zValidator('json', createClientSchema), async (c) => {
  const data = c.req.valid('json')
  const db = drizzle(c.env.DB)
  const [newClient] = await db.insert(clients).values(data).returning()
  return c.json(newClient, 201)
})

// Get information about a client
app.get('/api/clients/:id', zValidator('param', idParamSchema), async (c) => {
  const { id } = c.req.valid('param')
  const db = drizzle(c.env.DB)
  const [client] = await db.select().from(clients).where(eq(clients.id, id))
  if (!client) return c.json({ error: 'Client not found' }, 404)
  return c.json(client)
})

// Edit information about a client
app.patch(
  '/api/clients/:id',
  zValidator('param', idParamSchema),
  zValidator('json', updateClientSchema),
  async (c) => {
    const { id } = c.req.valid('param')
    const data = c.req.valid('json')
    const db = drizzle(c.env.DB)
    const [client] = await db
      .update(clients)
      .set(data)
      .where(eq(clients.id, id))
      .returning()
    if (!client) return c.json({ error: 'Client not found' }, 404)
    return c.json(client)
  },
)

// Delete client
app.delete(
  '/api/clients/:id',
  zValidator('param', idParamSchema),
  async (c) => {
    const { id } = c.req.valid('param')
    const db = drizzle(c.env.DB)
    const [client] = await db
      .delete(clients)
      .where(eq(clients.id, id))
      .returning()
    if (!client) return c.json({ error: 'Client not found' }, 404)
    return c.body(null, 204)
  },
)

export default app
