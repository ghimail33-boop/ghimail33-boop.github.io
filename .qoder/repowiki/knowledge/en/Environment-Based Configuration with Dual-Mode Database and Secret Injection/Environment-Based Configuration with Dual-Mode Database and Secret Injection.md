---
kind: configuration_system
name: Environment-Based Configuration with Dual-Mode Database and Secret Injection
category: configuration_system
scope:
    - '**'
source_files:
    - .env.example
    - server.ts
    - server/db.ts
    - server/middleware/auth.ts
    - vite.config.ts
    - package.json
---

## Overview

The application uses a minimal, environment-variable-driven configuration system. There is no centralized config module or typed configuration loader — instead, runtime behavior is controlled by `process.env` values read directly at startup in the server entrypoint and database initializer.

## Environment Variables

All configuration comes from environment variables (loaded via `dotenv`, which is listed as a dependency but not explicitly required anywhere in the codebase; it may be loaded by the dev runner). The documented and used variables are:

| Variable | Used In | Purpose |
|---|---|---|
| `DATABASE_URL` | `server/db.ts` | Primary connection string for external PostgreSQL. If present, PGlite is skipped. |
| `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT` | `server/db.ts` | Fallback per-field Postgres credentials when `DATABASE_URL` is absent. |
| `JWT_SECRET` | `server/middleware/auth.ts` | JWT signing/verification key; falls back to a hardcoded default string if unset. |
| `NODE_ENV` | `server.ts` | Controls production vs development mode (Vite dev server vs static `dist/`). |
| `DISABLE_HMR` | `vite.config.ts` | Disables Vite HMR and file watching in AI Studio / agent-edit environments. |
| `GEMINI_API_KEY` | `.env.example` only | Documented secret for Gemini AI calls; injected by the hosting platform's Secrets panel. |
| `APP_URL` | `.env.example` only | Host URL for self-referential links and OAuth callbacks; injected by the hosting platform. |

## Runtime Modes

### Database Mode Selection
`server/db.ts:initDb()` chooses between two backends based on env vars:

1. **External PostgreSQL** — if `DATABASE_URL` is set OR both `PGHOST` and `PGDATABASE` are set, a `pg.Pool` is created using those environment values.
2. **Embedded PGlite** — otherwise, an in-process persistent PGlite instance is started against `<cwd>/data/pgdata`. On startup failure due to corruption, the directory is deleted and re-initialized.

This dual-mode choice is the central branching point of the configuration system.

### Dev vs Production Frontend Serving
In `server.ts`, `process.env.NODE_ENV === 'production'` determines whether Vite's dev middleware is mounted (development) or the built `dist/` folder is served statically (production).

### HMR Toggle
`vite.config.ts` reads `DISABLE_HMR` to disable Hot Module Replacement and file watching, a deployment-specific tweak for the AI Studio editing environment.

## Secrets Handling

- `JWT_SECRET` has a **hardcoded fallback** (`'nvc-procurement-secret-key-2081-nepal'`) so the app runs without explicit configuration, but this is insecure for real deployments.
- `GEMINI_API_KEY` and `APP_URL` are documented in `.env.example` as being **injected automatically by the hosting platform's Secrets panel** rather than checked into source control.
- No secrets manager, encrypted config files, or runtime secret refresh is implemented.

## Migrations & Schema Seeding

Configuration also drives data initialization:
- On first run (no `public.users` table), `database/schema.sql` is executed, then `database/seed.sql` loads demo data.
- A `schema_migrations` table tracks applied migrations under `database/migrations/*.sql`; migration files are discovered at runtime via `fs.readdirSync` and applied in sorted order.

## Conventions Observed

- Configuration is **flat environment variables**, not hierarchical config objects.
- Each module reads only the env vars it needs; there is no shared config registry.
- Optional secrets have **hardcoded defaults** rather than failing fast (e.g., `JWT_SECRET`).
- Externalized configuration is preferred for sensitive values (DB credentials, API keys); non-sensitive runtime toggles live in env too.
- The `.env.example` file documents expected variables but is not consumed at runtime by the code shown.
- Paths like `data/`, `uploads/`, `database/` are resolved relative to `process.cwd()`, making them portable across deployment targets.