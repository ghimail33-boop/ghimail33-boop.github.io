---
kind: logging_system
name: Console-based Logging with Persistent Audit Trail
category: logging_system
scope:
    - '**'
source_files:
    - server.ts
    - server/db.ts
    - server/utils/audit.ts
    - server/routes/auditLogs.ts
---

## What system/approach is used

The application has **no dedicated logging framework** (no Winston, Pino, Bunyan, Morgan, or similar). All operational and diagnostic output goes through Node's built-in `console.log`, `console.warn`, and `console.error` calls. The only structured, persistent logging mechanism is a custom audit trail that writes user-impacting actions to the PostgreSQL `audit_logs` table via `server/utils/audit.ts`.

## Key files and packages

- `server.ts` — server bootstrap; emits `[NVC SERVER]` prefixed console messages for startup, DB init, and fatal errors.
- `server/db.ts` — database initialization and migration runner; emits `[DB]` prefixed console messages for connection state, schema execution, seed data loading, migration application, and query errors.
- `server/utils/audit.ts` — the sole structured logger: `logAudit(userId, username, action, entityType, entityId, oldValues, newValues, ipAddress)` inserts an audit record into the `audit_logs` table, serializing `old_values` and `new_values` as JSON.
- `server/routes/auditLogs.ts` — exposes `/api/audit-logs` (protected by `authenticate` + `requireRole(['admin','reviewer'])`) to query the persisted audit log with optional `action` and `entity_type` filters and a `limit`.
- Route handlers under `server/routes/*.ts` — each route module imports `logAudit` from `../utils/audit.ts` and calls it around create/update/delete operations to persist who did what.

## Architecture and conventions

1. **Console logs are ad-hoc and tag-prefixed.** Every `console.log/warn/error` call in the codebase uses a bracketed tag prefix (`[NVC SERVER]`, `[DB]`, `[AUDIT LOG ERROR]`) so that log lines can be visually filtered in a terminal. There is no central logger instance, no log level configuration, and no formatter.

2. **Audit events are persisted, not just printed.** The `logAudit` helper wraps a parameterized INSERT into `audit_logs(user_id, username, action, entity_type, entity_id, old_values, new_values, ip_address)`. Errors during audit insertion are swallowed and reported via `console.error('[AUDIT LOG ERROR]', err)` rather than propagated, ensuring audit failures do not break the calling request.

3. **Audit data is queried through a dedicated API endpoint.** The `GET /api/audit-logs` route supports filtering by `action` and `entity_type` and ordering by `timestamp DESC` with a default limit of 100 rows. Access is restricted to roles `admin` and `reviewer` via the shared `authenticate` and `requireRole` middleware.

4. **No request/response or HTTP-level logging exists.** There is no Express middleware like Morgan, and no per-request correlation IDs. Request lifecycle logging is absent; only business-action auditing is captured.

5. **Error handling in routes falls back to `console.error`.** Route handlers catch exceptions and log them with `console.error('... error:', err)` before returning a 500 response. There is no unified error handler or structured error log format beyond the plain message plus the thrown object.

## Conventions and constraints

- **Tag-prefix convention**: Console output consistently uses `[TAG]` prefixes (`[NVC SERVER]`, `[DB]`, `[AUDIT LOG ERROR]`) to distinguish subsystems at a glance.
- **Audit fields are fixed**: Every audit entry must include `user_id`, `username`, `action`, `entity_type`, `entity_id`, `old_values` (JSON), `new_values` (JSON), and `ip_address`; callers supply these via `logAudit`.
- **Audit failures are non-fatal**: `logAudit` catches its own errors and logs them via `console.error`, so audit persistence never aborts the caller's transaction.
- **Audit log access is role-gated**: Only users with `admin` or `reviewer` roles can read audit logs through the `/api/audit-logs` endpoint.
- **No log levels or structured formatting**: The codebase does not define or enforce log levels, timestamps, correlation IDs, or JSON-formatted log lines for console output — those are left to the runtime environment or external process manager.