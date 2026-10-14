# Slotwise: product and technical spec

Status: approved for implementation. Owner: Oskar Pajka. Last updated: 2026-10-14.

Slotwise is a self-hosted web app for a single business owner (first user: a permanent makeup salon in Poland) to manage clients, services and appointments on a calendar, and to send SMS confirmations and reminders to clients. Clients never log in or see the app.

It is also a public portfolio project, so code quality, tests and documentation matter as much as features.

---

## 1. Scope

### In scope (v1.0)

- One owner account. Sign-up disabled. Owner created by a seed script from env vars.
- Clients: first name, last name, phone, email, notes, tags, SMS opt-out, separate encrypted health info field with consent date.
- Client page: current appointment ("in progress now"), upcoming, past; totals; no-show count.
- Services: name, price, duration, color, active or archived, sort order.
- Appointments: create, move, resize, cancel; statuses `scheduled`, `completed`, `cancelled`, `no_show`; price and duration snapshot copied from the service at booking; notes.
- Calendar: day, week, month views; today button; drag to move; resize; agenda view on phones.
- Availability: working hours per weekday, breaks, blocked days, shown greyed out on the calendar; warn when booking outside them.
- SMS: confirmation, reminder before the visit, change notice, cancellation notice. Suggested templates the owner can rewrite. Final text shown in the booking dialog and editable for that one message before sending. Delivery status per message.
- RODO (GDPR) tools: client export (JSON and PDF), client delete, inactive-clients review list, link to the salon's privacy notice.
- Polish and English UI. Light and dark theme. Installable PWA.

### Out of scope (do not build)

- Client self-booking or any client-facing page (except one optional static privacy notice page).
- Staff accounts, multiple calendars.
- Payments, invoices.
- Marketing or promotional SMS.
- AI call agent.

---

## 2. Tech stack

Verify the current stable version and current docs of every tool before using it. Do not rely on memory for APIs; Next.js 16 changed several conventions.

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16, App Router, Server Actions, TypeScript strict |
| Database | PostgreSQL |
| ORM | Drizzle ORM + drizzle-kit (SQL migrations committed) |
| Auth | Better Auth with Drizzle adapter, email + password, two-factor plugin (required for the owner) |
| UI | Tailwind CSS v4 + shadcn/ui |
| Calendar | Schedule-X (MIT core). Confirm which plugins are free before use; only free plugins allowed. Fallback: FullCalendar standard (MIT) packages |
| Forms and validation | React Hook Form + Zod (same schema on client and in server actions) |
| Dates | Store `timestamptz` in UTC, display in `Europe/Warsaw`. Temporal polyfill or date-fns-tz |
| Phone numbers | libphonenumber-js, stored as E.164 |
| Background jobs | pg-boss (queue in Postgres), run in a separate worker process from the same codebase |
| SMS | `SmsProvider` interface; `SmsApiProvider` (SMSAPI.pl) and `OutboxProvider` (stores messages, sends nothing) |
| i18n | next-intl, locales `pl` (default) and `en` |
| Tests | Vitest (unit, integration against a real Postgres in Docker), Playwright (end-to-end, desktop and mobile viewports) |
| Code quality | Biome (lint + format), pnpm |
| Runtime | Docker Compose: `app`, `worker`, `postgres`, `caddy` |
| CI | GitHub Actions: Biome, type check, Vitest, Playwright, Docker build |

---

## 3. Data model

Money is stored as integer grosze (12000 = 120,00 zl). All timestamps are `timestamptz`.

| Table | Columns | Notes |
| --- | --- | --- |
| `clients` | id, first_name, last_name, phone_e164, email, notes, tags, sms_opt_out, health_info (encrypted), health_consent_at, archived_at, created_at, updated_at | Archive for normal removal; hard delete for RODO requests |
| `services` | id, name, price_grosze, duration_min, color, is_active, sort_order | Never hard-deleted once used |
| `appointments` | id, client_id, service_id, starts_at, ends_at, status, price_grosze, duration_min, notes, created_at, updated_at | price and duration are snapshots |
| `working_hours` | weekday, opens_at, closes_at | One row per open weekday |
| `time_blocks` | id, starts_at, ends_at, reason | Breaks, holidays, days off |
| `sms_messages` | id, appointment_id, client_id, type, body, status, provider_message_id, error, scheduled_for, sent_at, created_at | Outbox and history. type: confirmation, reminder, changed, cancelled. status: queued, sent, delivered, failed, cancelled |
| `settings` | business_name, timezone, reminder_hours_before, sms_templates, sender_name, strip_polish_chars, privacy_notice_url, retention_years | Single row |
| `audit_log` | id, at, action, entity, entity_id | Login, export, delete, settings change. No personal data in the log |

### Double-booking guard (required, in a migration)

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE appointments ADD CONSTRAINT no_overlap
  EXCLUDE USING gist (tstzrange(starts_at, ends_at) WITH &&)
  WHERE (status IN ('scheduled', 'completed'));
```

The UI must catch the constraint error and show a friendly message.

### Health info encryption

`health_info` is encrypted in the application (AES-256-GCM or libsodium secretbox) with a key from the `HEALTH_INFO_KEY` env var, never stored in the database. Decrypt only when the client page is opened. Show a hint near general notes: "Do not write health details here; use the health field."

---

## 4. SMS rules

- Booking saves the appointment and enqueues SMS jobs in the same database transaction. The worker sends them. A failing provider must never block or roll back a booking.
- Retries with backoff; after the last failure, status `failed` shown on the appointment.
- Reminder jobs are scheduled at booking time for `starts_at - reminder_hours_before`. Moving or cancelling an appointment cancels and re-creates them.
- No SMS to clients with `sms_opt_out = true`; the UI explains why.
- Templates: default Polish and English text for each type, editable in Settings, with "restore default". Placeholders: `{imie}`, `{data}`, `{godzina}`, `{usluga}`, `{firma}`. Live preview with real client data.
- Character and segment counter in the editor. Polish diacritics switch SMS to Unicode (about 70 characters per segment instead of 160). Setting `strip_polish_chars` converts them to plain letters before sending.
- Messages contain service information only, never promotions.
- Delivery status updated by the provider's callback or by polling, whichever SMSAPI supports best (check their current docs).
- Provider chosen by `SMS_PROVIDER=smsapi|outbox`. Dev, tests and demo always use `outbox`. An Outbox page lists stored messages.

---

## 5. Security and privacy

- Every server action and route handler calls one `requireOwner()` helper first, then validates input with Zod.
- Two-factor authentication required for the owner.
- Rate-limit the login route. Secure, httpOnly, sameSite session cookies.
- Postgres is never exposed outside the Docker network.
- Secrets only in `.env`; `.env.example` documents every variable. `.gitignore` blocks `.env*` (except the example), dumps and backups.
- Seed data uses fake names and numbers only. Real client data never enters the repository.
- Backups: nightly `pg_dump`, encrypted with `restic`, sent off-server. `docs/deployment.md` contains a tested restore procedure.
- RODO features: export one client (JSON + PDF), hard delete one client and their SMS history, inactive-clients list (no visit in `retention_years`), privacy notice link in Settings.

---

## 6. UX requirements

- Mobile first. Every screen usable at 375 px width. Phone default calendar view: day or agenda. Desktop default: week.
- Create an appointment in at most 3 taps or clicks from the calendar: pick slot, pick client (search or quick-add), pick service.
- Quick-add client inside the booking dialog.
- Client search by name or phone from anywhere (command palette on desktop).
- Visual style: restrained and editorial. Neutral palette, one accent, generous spacing, strong typography. No gradients or neon.

---

## 7. Roadmap

Each phase ends with passing CI, updated docs and a git tag. Stop after each phase for review.

1. **Foundation (v0.1.0).** Next.js, TypeScript strict, Biome, Tailwind, shadcn/ui, Docker Compose with Postgres, Drizzle with first migration, Vitest and Playwright set up, CI green. Done when `docker compose up` serves an empty app.
2. **Auth.** Better Auth, seeded owner, login page, 2FA, protected layout, rate limit. Done when every page redirects to login when signed out.
3. **Clients and services (v0.2.0).** CRUD, search, archive, phone validation, encrypted health field. Done when 20 fake clients can be added and found on a phone.
4. **Appointments and calendar (v0.3.0).** Calendar views, create, move, resize, statuses, overlap constraint, client history page. Done when a full week can be booked on a phone.
5. **Availability.** Working hours, breaks, blocked days on the calendar.
6. **SMS (v0.4.0).** Provider interface, outbox, worker, all message types, templates, counter, status. Done when a real SMS reaches a test phone and the outbox shows its status.
7. **Ship (v1.0.0).** i18n, PWA, RODO tools, backups, full Playwright suite, docs, README with screenshots and video.

---

## 8. Documentation deliverables

| File | Content |
| --- | --- |
| `README.md` | Product video or GIF placeholder, pitch, features, screenshots (desktop and phone), quick start, stack, links |
| `docs/architecture.md` | Containers, request flow, SMS job flow, folder structure |
| `docs/data-model.md` | Mermaid ER diagram, tables, constraints |
| `docs/adr/NNNN-title.md` | One Architecture Decision Record per major choice |
| `docs/deployment.md` | VPS setup, Docker Compose, env vars, HTTPS, backups and restore |
| `docs/sms.md` | Provider setup, templates, encoding and costs |
| `docs/rodo/` | Processing register template and notes for the salon owner |
| `GLOSSARY.md` | Shared domain language |
| `CHANGELOG.md` | Keep a Changelog format |
| `CONTRIBUTING.md`, `LICENSE` (MIT) | Standard |

---

## 9. Glossary (starting point)

- **Owner**: the one person who logs in and runs the business.
- **Client**: a customer of the business. Never a user of the app.
- **Service**: something the business sells, with a price and duration.
- **Appointment**: one client booked for one service at a time slot.
- **Snapshot**: price and duration copied onto an appointment at booking time.
- **Block**: a time range where nothing can be booked (break, holiday).
- **Outbox**: the stored record of every SMS, sent or not.
