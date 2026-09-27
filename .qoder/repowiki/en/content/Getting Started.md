# Getting Started

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [README.md](file://README.md)
- [server.ts](file://server.ts)
- [vite.config.ts](file://vite.config.ts)
- [server/db.ts](file://server/db.ts)
- [database/schema.sql](file://database/schema.sql)
- [database/migrations/002_full_checklist_34_stages.sql](file://database/migrations/002_full_checklist_34_stages.sql)
- [server/routes/auth.ts](file://server/routes/auth.ts)
- [src/services/api.ts](file://src/services/api.ts)
</cite>

## Table of Contents
1. Introduction
2. Project Structure
3. Core Components
4. Architecture Overview
5. Detailed Component Analysis
6. Dependency Analysis
7. Performance Considerations
8. Troubleshooting Guide
9. Conclusion

## Introduction
This guide helps you set up and run the NVC Procurement Monitoring & Inspection System locally for development or production. It covers environment prerequisites, installation steps, database setup options (external PostgreSQL vs embedded PGlite), running the application, initial user setup, basic navigation, environment variables, file structure expectations, troubleshooting, and verification steps.

## Project Structure
The system is a Node.js/TypeScript server with an Express API and a React frontend built with Vite. On startup, the server initializes the database (either external PostgreSQL or embedded PGlite), applies schema and migrations, serves static assets in production, and exposes REST endpoints under /api.

```mermaid
graph TB
Client["Browser"] --> Server["Express Server<br/>server.ts"]
Server --> DBExt["External PostgreSQL<br/>PG* env vars"]
Server --> DBEmbedded["PGlite Embedded DB<br/>data/pgdata"]
Server --> Static["Static Frontend<br/>dist (prod)"]
Server --> Routes["API Routes<br/>server/routes/*"]
Routes --> DBExt
Routes --> DBEmbedded
```

**Diagram sources**
- [server.ts:23-86](file://server.ts#L23-L86)
- [server/db.ts:10-48](file://server/db.ts#L10-L48)

**Section sources**
- [server.ts:23-86](file://server.ts#L23-L86)
- [vite.config.ts:6-21](file://vite.config.ts#L6-L21)

## Core Components
- Server bootstrap and routing: Express app, middleware, health check, Vite integration in dev, static serving in prod.
- Database layer: Auto-detects external PostgreSQL via environment variables; otherwise uses persistent embedded PGlite. Applies schema.sql and migration files on startup.
- Authentication: Login, profile retrieval, admin user management with audit logging.
- Frontend API client: Centralized fetch wrappers that call /api endpoints and attach auth tokens.

Key responsibilities:
- server.ts: Starts the server, mounts routes, handles dev/prod asset serving.
- server/db.ts: Initializes DB connection, runs schema and migrations, provides query helpers.
- server/routes/auth.ts: Implements login and user CRUD endpoints.
- src/services/api.ts: Frontend API client used by UI components.

**Section sources**
- [server.ts:23-86](file://server.ts#L23-L86)
- [server/db.ts:10-181](file://server/db.ts#L10-L181)
- [server/routes/auth.ts:10-228](file://server/routes/auth.ts#L10-L228)
- [src/services/api.ts:21-440](file://src/services/api.ts#L21-L440)

## Architecture Overview
The runtime flow starts the server, initializes the database, sets up middleware and routes, and serves the SPA. In development, Vite injects HMR; in production, it serves compiled assets from dist.

```mermaid
sequenceDiagram
participant Dev as "Developer"
participant Srv as "Server (server.ts)"
participant DB as "DB Layer (server/db.ts)"
participant R as "Routes (server/routes/*)"
participant FE as "Frontend (Vite/React)"
Dev->>Srv : npm run dev / npm start
Srv->>DB : initDb()
DB-->>Srv : ready (external PG or PGlite)
Srv->>R : mount /api/* routes
alt Development
Srv->>FE : serve via Vite middleware
else Production
Srv->>FE : serve static from dist
end
FE->>R : HTTP requests to /api/*
R->>DB : queries/migrations
DB-->>R : results
R-->>FE : JSON responses
```

**Diagram sources**
- [server.ts:23-86](file://server.ts#L23-L86)
- [server/db.ts:10-181](file://server/db.ts#L10-L181)

## Detailed Component Analysis

### Environment Prerequisites
- Node.js: The project uses modern ESM and TypeScript tooling. Ensure a recent LTS version of Node.js is installed.
- Optional: External PostgreSQL server if you plan to use DATABASE_URL or PG* environment variables.

Installation commands:
- Install dependencies: npm install
- Run development server: npm run dev
- Build for production: npm run build
- Start production server: npm start

Notes:
- The README mentions setting GEMINI_API_KEY for AI features; this is optional and not required for core procurement functionality.

**Section sources**
- [package.json:6-12](file://package.json#L6-L12)
- [README.md:11-20](file://README.md#L11-L20)

### Database Setup Options

#### Option A: External PostgreSQL
Set one of the following in your environment:
- DATABASE_URL=postgresql://user:password@host:port/database
- Or individual variables: PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD

Behavior:
- The server will connect to the external PostgreSQL instance using the provided credentials.
- On first run, it executes database/schema.sql and then applies any pending migrations from database/migrations/*.sql.
- If tables are missing, seed data is loaded automatically.

Verification:
- Ensure the database exists and the user has permissions to create tables and run migrations.
- Check server logs for “Connecting to external PostgreSQL server...” and “Schema executed successfully.”

**Section sources**
- [server/db.ts:18-32](file://server/db.ts#L18-L32)
- [server/db.ts:50-87](file://server/db.ts#L50-L87)

#### Option B: Embedded PGlite (no external DB required)
If no DATABASE_URL or PG* variables are set, the server initializes an embedded persistent PostgreSQL using PGlite stored under data/pgdata.

Behavior:
- Creates data/pgdata if missing.
- Attempts to start PGlite; if existing data is invalid, resets the embedded database and restarts.
- Executes schema.sql and migrations, then seeds demo data on fresh databases.

Verification:
- Confirm data/pgdata directory is created and populated after startup.
- Logs should show “Initializing embedded persistent PostgreSQL (PGlite)...” and “Seed executed successfully!”

**Section sources**
- [server/db.ts:33-48](file://server/db.ts#L33-L48)
- [server/db.ts:50-87](file://server/db.ts#L50-L87)

### Running the Application Locally

Development:
- Install dependencies: npm install
- Start the dev server: npm run dev
- Open http://localhost:3000 in your browser.

Production:
- Build the frontend: npm run build
- Start the server: npm start
- Serve behind a reverse proxy or container as needed.

Environment Variables:
- DATABASE_URL or PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD for external PostgreSQL.
- NODE_ENV=production for production builds.
- DISABLE_HMR=true can be used to disable HMR during development if needed.

File Structure Expectations:
- data/pgdata: Used by PGlite for embedded database persistence.
- uploads: Created automatically for evidence and document storage.
- database/schema.sql: Initial schema applied on fresh databases.
- database/migrations: SQL migration files applied idempotently.

**Section sources**
- [server.ts:23-86](file://server.ts#L23-L86)
- [server/db.ts:10-48](file://server/db.ts#L10-L48)
- [vite.config.ts:14-20](file://vite.config.ts#L14-L20)

### Initial User Setup and Basic Navigation

Initial Users:
- On a fresh database, seed data is loaded which includes roles, offices, and users. Use the provided credentials from the seed to log in.

Login Flow:
- Navigate to the login page and enter username/password.
- On success, a token is stored and subsequent API calls include Authorization: Bearer <token>.

Admin User Management:
- Admin-only endpoints allow listing, creating, and updating users. Use these to add additional users and assign roles.

Basic Navigation:
- After login, access modules such as Procurements, Inspections, Findings, Corrective Actions, Reports, and Audit Logs via the sidebar.

**Section sources**
- [server/routes/auth.ts:10-80](file://server/routes/auth.ts#L10-L80)
- [server/routes/auth.ts:106-228](file://server/routes/auth.ts#L106-L228)
- [src/services/api.ts:34-74](file://src/services/api.ts#L34-L74)

### API Endpoints Overview
- Authentication: POST /api/auth/login, GET /api/auth/me, GET/POST/PUT /api/auth/users (admin).
- Master Data: GET /api/master/stages, provinces, districts, municipalities, ministries, offices, fiscal-years.
- Procurements: GET/POST/PUT /api/procurements, document status updates.
- Checklists: GET/POST/PUT /api/checklists.
- Inspections: GET/POST/PUT /api/inspections, checklist save-item.
- Findings: GET/POST/PUT/DELETE /api/findings.
- Corrective Actions: GET/POST/PUT /api/corrective-actions, verify endpoint.
- Evidence: GET/POST/DELETE /api/evidence/*, upload with FormData.
- Dashboard: GET /api/dashboard/summary.
- Reports: GET /api/reports/inspection/:id.
- Audit Logs: GET /api/audit-logs.

**Section sources**
- [src/services/api.ts:34-440](file://src/services/api.ts#L34-L440)

## Dependency Analysis
High-level runtime dependencies:
- Express server with CORS and JSON parsing.
- Database drivers: pg for external PostgreSQL, @electric-sql/pglite for embedded mode.
- Frontend: React + Vite with Tailwind CSS plugin.
- Utilities: bcryptjs for password hashing, jsonwebtoken for tokens, multer for uploads.

Startup dependency chain:
- server.ts imports db initialization and all route modules.
- server/db.ts chooses between external PG and PGlite based on environment variables.
- Routes depend on db.query/executeRaw for data operations.

```mermaid
graph LR
A["server.ts"] --> B["server/db.ts"]
A --> C["server/routes/*"]
C --> B
B --> D["pg (external PostgreSQL)"]
B --> E["@electric-sql/pglite (embedded)"]
```

**Diagram sources**
- [server.ts:1-18](file://server.ts#L1-L18)
- [server/db.ts:1-48](file://server/db.ts#L1-L48)

**Section sources**
- [package.json:14-35](file://package.json#L14-L35)
- [server.ts:1-18](file://server.ts#L1-L18)
- [server/db.ts:1-48](file://server/db.ts#L1-L48)

## Performance Considerations
- Use external PostgreSQL for production workloads to leverage connection pooling and robust performance.
- PGlite is suitable for local development and small-scale testing; ensure sufficient disk space for data/pgdata.
- Keep uploads directory writable and monitor disk usage for evidence files.
- Avoid excessive payload sizes; server limits JSON and URL-encoded bodies to 20MB.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide

Common Issues and Resolutions:
- Cannot connect to external PostgreSQL:
  - Verify DATABASE_URL or PG* variables are correct and reachable.
  - Ensure the database exists and the user has privileges.
  - Check logs for connection errors and adjust firewall/network settings.

- PGlite data corruption:
  - On startup, the server detects invalid PGlite data and resets data/pgdata automatically.
  - If issues persist, delete data/pgdata manually and restart to rebuild.

- Schema or migrations fail:
  - Confirm database/schema.sql is present and readable.
  - Ensure database/migrations folder contains valid SQL files.
  - Review logs for specific SQL errors and fix schema or permissions.

- Frontend cannot reach API:
  - Ensure the server is running on port 3000 and CORS is enabled.
  - Check browser console for network errors and confirm base path /api is correct.

- Uploads not saved:
  - Verify the uploads directory exists and is writable by the process.
  - Check file size limits and content types allowed by multer.

- Health check:
  - Call GET /api/health to verify the server is up and responding.

**Section sources**
- [server/db.ts:18-48](file://server/db.ts#L18-L48)
- [server/db.ts:50-87](file://server/db.ts#L50-L87)
- [server.ts:57-65](file://server.ts#L57-L65)

## Conclusion
You now have the essentials to install, configure, and run the NVC Procurement Monitoring & Inspection System. Choose between external PostgreSQL for production or embedded PGlite for development, apply schema and migrations automatically on startup, create initial users via seed or admin endpoints, and navigate the core modules. Use the troubleshooting tips to resolve common setup issues and verify your installation with the health endpoint.