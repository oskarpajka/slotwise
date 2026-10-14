# Agent rules for Slotwise

Read `SPEC.md` and `GLOSSARY.md` before any work. The spec is the source of truth; if something in it looks wrong or a better option exists, say so and ask before changing course.

## How we work

- The human (Oskar) makes architecture decisions. When a choice is not settled in the spec, present 2 or 3 options with trade-offs and a recommendation, then wait.
- Work one ticket at a time, in small vertical slices. Test first (red, green, refactor) for logic: server actions, SMS scheduling, availability, overlap handling, encryption, template rendering.
- After each slice: run `pnpm check` (Biome + type check + tests). Never commit with failing checks.
- Explain what you built in plain words at the end of each ticket: which files changed, why, and anything Oskar should understand before moving on.
- Never delete or rewrite working code that is outside the ticket's scope.
- Check current official docs for library APIs instead of relying on memory.

## Code standards

- TypeScript strict. No `any`. No non-null assertions without a comment explaining why.
- Domain names from `GLOSSARY.md` in code, files and UI copy.
- Server code: every action starts with `requireOwner()`, then Zod validation. One exception: the SMS delivery callback route, see `docs/adr/0001-sms-callback-route-is-not-owner-authenticated.md`.
- Money as integer grosze; time as UTC `timestamptz`, displayed in `Europe/Warsaw`.
- No user-facing strings in components; use next-intl messages (`pl` and `en`).
- Small, deep modules: simple interface, logic hidden behind it, tested through that interface.

## Safety

- Never commit secrets, `.env` files, database dumps or real personal data. Seed data is fake.
- Dev, tests and CI always use `SMS_PROVIDER=dry-run`. Never send a real SMS unless Oskar asks in the current session.
- Never run destructive database commands against anything except the local dev database.

## Git

- Conventional commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
- One branch and one pull request per ticket. PR description: summary, how it was tested, screenshots for UI changes.

## Writing style

- Plain, short sentences in docs and UI copy.
- Never use the em dash character anywhere: code comments, docs, UI text, commit messages.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes, APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev`, verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
