# AI Log

This file records how I use AI in Slotwise, as required by Pixl's AI disclosure rules.
I write and type all application code myself. AI acts as a tutor and code reviewer.

Tool: Claude Code (Claude Opus 5.5)

## Format

One entry per session:

- **Date:** YYYY-MM-DD
- **What I asked for:** short description
- **What the AI did:** explained / reviewed / suggested / generated (say which)
- **Files the AI wrote or edited, if any:** list them, or "none"
- **What I did myself:** short description

## Entries

### 2026-10-25

- **What I asked for:** help planning Slotwise (stack, data model, milestones) and setting up the project
- **What the AI did:** explained the stack and recommended Cloudflare Workers + D1 and an SMS design, drafted the data model and milestones with me, explained Hono, Workers, compatibility dates, the SPA fallback, and the TypeScript configs, gave short config snippets, reviewed my journal entry
- **Files the AI wrote or edited, if any:** `AI_LOG.md` (empty template only). No project code
- **What I did myself:** ran all setup commands, typed `vite.config.ts`, `wrangler.jsonc`, `worker/index.ts`, the tsconfig changes and the `cf-typegen` script, fixed `.gitignore`, made all commits
