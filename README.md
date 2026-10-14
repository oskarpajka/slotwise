# Slotwise

A self-hosted web app for one business owner to manage clients, services and appointments, and to send SMS reminders. Clients never log in.

Status: foundation phase. The app serves a themed, translated shell. Features come in later phases, see `SPEC.md`.

## Quick start

You need Docker with Compose.

```bash
git clone https://github.com/oskarpajka/slotwise.git
cd slotwise
cp .env.example .env
docker compose up --build
```

Open http://localhost:8080.

On start, the `migrate` service applies the database migrations, then the app starts. Postgres is only reachable inside the Docker network.

Stop with `docker compose down`. Add `-v` to also delete the database volume.

## Local development

You need Node 24 and pnpm.

```bash
pnpm install
cp .env.example .env
pnpm db:up        # Postgres only, on 127.0.0.1:5432 (development only)
pnpm db:migrate
pnpm dev
```

Run `pnpm check` before every commit. It runs Biome, the type check and the tests. The integration tests need `pnpm db:up`.

## Docs

- `SPEC.md`: product and technical spec
- `GLOSSARY.md`: shared domain language
- `docs/architecture.md`: containers and how they connect
- `docs/adr/`: architecture decision records
