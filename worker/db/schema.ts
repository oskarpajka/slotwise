import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const clients = sqliteTable('clients', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text(),
  notes: text(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
})

export const admins = sqliteTable('admins', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const sessions = sqliteTable('sessions', {
  id: text().primaryKey(),
  adminId: integer('admin_id', { mode: 'number' })
    .notNull()
    .references(() => admins.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
})
