---
kind: external_dependency
name: Embedded PostgreSQL via PGlite
slug: pglite
category: external_dependency
category_hints:
    - framework_behavior
scope:
    - '**'
source_files:
    - server/db.ts
    - package.json
---

### Role
- Default database engine when no external PostgreSQL is configured; runs an in-process persistent Postgres instance backed by `data/pgdata`.

### Integration shape
- Schema (`database/schema.sql`) runs once on first boot; migrations in `database/migrations/*.sql` run idempotently via a `schema_migrations` table; seed data (`database/seed.sql`) runs only on fresh DBs.
- All downstream routes call `db.query` / `db.executeRaw`, never touching `pg` or `PGlite` directly.

### Stable notes
- Production deployments should set `DATABASE_URL` (or `PGHOST`+`PGDATABASE`) to use a managed Postgres; the embedded PGlite path is intended for local/dev or single-instance demos.
- Verify exact connection options against the official PGlite docs before switching modes.