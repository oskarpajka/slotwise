# Slotwise

A booking and client manager for small companies.

Live demo: https://slotwise.oskar-pajka16.workers.dev/

## Why I'm building it

I came across multiple booking tools but I found them very expensive. Most of them also contain too much unnecessary features. That is why I am building Slotwise. I want there to exist an open-source, free, unbloated alternative that is available to everyone.

## Features (planned)

- Client records with notes and appointment history
- Services with various prices and durations
- Day and week calendar (easily drag and drop appointments to move them)
- Booking appointments
- SMS messages to the client's phone number when an appointments is booked, modified... with editable templates
- Works on desktop and mobile

## Built with

- React + Vite: the user interface
- TypeScript: the whole project
- Hono: the backend API
- Cloudflare Workers: where the backend runs
- Cloudflare D1 (SQLite): the database
- Drizzle ORM: database schema and queries
- Zod: validating incoming data
- ESLint + Prettier: code quality

## Setup and run

1. Requirements (Node 22+)
2. npm install
3. npx wrangler d1 migrations apply slotwise --local
4. npm run dev, then open `http://localhost:5173`

Or open it in GitHub Codespaces (Code > Codespaces): steps 2 and 3 run automatically, so you only need `npm run dev`.

## Screenshots

(Coming soon)

## Privacy

Only demo data is used in this repository.
