# Changelog

All notable changes to Slotwise are listed here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Next.js app with strict TypeScript, Biome and `pnpm check`.
- Tailwind CSS, shadcn/ui and a Polish and English shell with light and dark themes.
- Docker Compose with `app`, `migrate`, `postgres` and `caddy`.
- Drizzle schema, the first migration and the `no_overlap` double-booking guard.
- Playwright smoke tests at desktop and 375 px widths.
- GitHub Actions workflow: Biome, type check, Vitest, Playwright and the Docker build.
