# Slotwise

A self-hosted web app for one business owner to manage clients, services and appointments, and to send SMS reminders. Clients never log in.

Status: auth phase. The owner signs in with email and password. Features come in later phases, see `SPEC.md`.

## Quick start

You need Docker with Compose.

```bash
git clone https://github.com/oskarpajka/slotwise.git
cd slotwise
cp .env.example .env   # then set BETTER_AUTH_SECRET
docker compose up --build
```

Open http://localhost:8080. Every page sends you to the login page until you sign in. To create the owner account from your machine, run `pnpm db:up` (it adds a Postgres port on 127.0.0.1) and then `pnpm owner:create`, see Local development. A command-line image that does this inside Docker comes with the operator tools.

On start, the `migrate` service applies the database migrations, then the app starts. Postgres is only reachable inside the Docker network.

Stop with `docker compose down`. Add `-v` to also delete the database volume.

## Local development

You need Node 24 and pnpm.

```bash
pnpm install
cp .env.example .env
pnpm db:up        # Postgres only, on 127.0.0.1:5432 (development only)
pnpm db:migrate
pnpm owner:create   # reads OWNER_EMAIL and OWNER_PASSWORD from .env
pnpm dev
```

For `pnpm dev`, set `BETTER_AUTH_URL=http://localhost:3000` in `.env`: sign-in only accepts requests from that address.

`pnpm owner:create` creates the one owner account and refuses when one already exists. The password needs at least 12 characters. Delete `OWNER_PASSWORD` from `.env` afterwards. Sign-up is off, so this is the only way to create an account.

Run `pnpm check` before every commit. It runs Biome, the type check and the tests. The integration tests need `pnpm db:up`.

Browser tests: `pnpm exec playwright install chromium` once, then `pnpm build` and `pnpm e2e`. They run at desktop and 375 px widths against the production build. They create their own `slotwise_e2e` database with a fake owner, so your dev data is not touched.

## Docs

- `SPEC.md`: product and technical spec
- `GLOSSARY.md`: shared domain language
- `docs/architecture.md`: containers and how they connect
- `docs/adr/`: architecture decision records
