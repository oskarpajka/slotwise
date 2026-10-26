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

### 2026-10-25 (Part 2)

- **What I asked for:** how to set up the database, how could I build the client api, asked which code quality tools would work in this project
- **What the AI did:** it explained: D1, bindings, local vs remote databases, drizzle, migrations, HTTP methods and status code, Zod validation, mass assignment, URL params are strings, promises, useState types, ??, default vs named exports, response.ok, Prettier, .gitattributes. It reviewed: my schema, every API route, App.tsx, ClienList.tsx, and the ESLint config. It pointed out bugs: exec() not returning rows, .minLength not being a method, typeof id !== 'number always being true, the empty PATCH body. The AI suggested: limits for the fields, null for empty phone and notes, the commit split. The AI also gave short snippets: config files, the zValidator and idParamSchema shape, the ClienList skeleton with TODOs, the console fetch test requests, the wrangler commands.
- **Files the AI wrote or edited, if any:** none
- **What I did myself:** I typed all the code and config, decided the schema rules, noticed the mass assignment risk myself, noticed the empty PATCH body problem myself, wrote GET one, PATCH and DELETE myself first, then fixed them after review, wrote ClientList.tsx, ran all the tests and made all the commits
