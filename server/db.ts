import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

// PostgreSQL को DATE टाइप (OID 1082) लाई JS Date object मा बदल्नुको सट्टा सिधै
// 'YYYY-MM-DD' string मै फर्काउने। अन्यथा सर्भरको लोकल टाइमजोन (नेपाल +५:४५) कारण
// JSON मा एक दिन अघिको UTC मिति जान्छ र नेपाली (BS) मिति एक दिन पछाडि देखिन्छ।
pg.types.setTypeParser(1082, (value: string) => value);

// Embedded PGlite का लागि पनि DATE लाई string मै फर्काउने parser
const PG_DATE_PARSERS = { 1082: (value: string) => value };

let pool: any = null;
let pgliteInstance: PGlite | null = null;
let isInitialized = false;

export async function initDb(): Promise<void> {
  if (isInitialized) return;

  const dataDir = path.resolve(process.cwd(), 'data');
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  const isDummyUrl = Boolean(
    databaseUrl && (
      databaseUrl.includes('YOUR_PROJECT_REF') ||
      databaseUrl.includes('[YOUR_DB_PASSWORD]') ||
      databaseUrl.includes('YOUR_') ||
      databaseUrl.includes('[') ||
      databaseUrl.includes('example.com')
    )
  );

  const useExternalPostgres = Boolean(
    (!isDummyUrl && databaseUrl) ||
    (process.env.PGHOST && process.env.PGDATABASE && !process.env.PGHOST.includes('YOUR_'))
  );

  const initEmbeddedPglite = async () => {
    console.log('[DB] Initializing embedded persistent PostgreSQL (PGlite)...');
    const pgDataPath = path.join(dataDir, 'pgdata');
    if (!fs.existsSync(pgDataPath)) fs.mkdirSync(pgDataPath, { recursive: true });

    try {
      pgliteInstance = new PGlite(pgDataPath, { parsers: PG_DATE_PARSERS });
      await pgliteInstance.waitReady;
    } catch (error) {
      console.warn('[DB] Existing PGlite data is invalid or corrupted. Resetting embedded database...', error);
      fs.rmSync(pgDataPath, { recursive: true, force: true });
      fs.mkdirSync(pgDataPath, { recursive: true });
      pgliteInstance = new PGlite(pgDataPath, { parsers: PG_DATE_PARSERS });
      await pgliteInstance.waitReady;
    }
  };

  if (useExternalPostgres) {
    try {
      console.log('[DB] Connecting to external PostgreSQL server...');
      const testPool = new pg.Pool({
        connectionString: databaseUrl,
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
        connectionTimeoutMillis: 3000,
        ssl: databaseUrl?.includes('supabase')
          ? { rejectUnauthorized: false }
          : undefined,
      });
      await testPool.query('SELECT 1');
      pool = testPool;
      console.log('[DB] Connected to external PostgreSQL server successfully.');
    } catch (err: any) {
      console.warn('[DB] External PostgreSQL connection failed:', err.message || err);
      console.warn('[DB] Falling back to embedded persistent PostgreSQL (PGlite)...');
      pool = null;
      await initEmbeddedPglite();
    }
  } else {
    await initEmbeddedPglite();
  }

  // Verify, migrate and seed tables
  try {
    let usersTableExists = false;
    if (pool) {
      const res = await pool.query("SELECT to_regclass('public.users') as exists");
      usersTableExists = Boolean((res.rows[0] as any)?.exists);
    } else if (pgliteInstance) {
      const res = await pgliteInstance.query<{ exists?: string }>("SELECT to_regclass('public.users') as exists");
      usersTableExists = Boolean((res.rows[0] as any)?.exists);
    }

    if (!usersTableExists) {
      console.log('[DB] Fresh database detected. Executing schema.sql...');
      const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'database/schema.sql'), 'utf-8');

      if (pool) {
        await pool.query(schemaSql);
      } else if (pgliteInstance) {
        await pgliteInstance.exec(schemaSql);
      }
      console.log('[DB] Schema executed successfully.');
    } else {
      console.log('[DB] Existing tables found. Checking for pending migrations...');
    }

    // Database migrations (schema_migrations मा tracking हुन्छ)
    await runMigrations();

    if (!usersTableExists) {
      console.log('[DB] Loading seed.sql (demo data)...');
      const seedSql = fs.readFileSync(path.resolve(process.cwd(), 'database/seed.sql'), 'utf-8');
      if (pool) {
        await pool.query(seedSql);
      } else if (pgliteInstance) {
        await pgliteInstance.exec(seedSql);
      }
      console.log('[DB] Seed executed successfully! Master checklist and demo data loaded.');
    }

    const countRes = await (pool ? pool.query('SELECT count(*) FROM checklist_items') : pgliteInstance!.query('SELECT count(*) FROM checklist_items'));
    console.log(`[DB] Master checklist items count: ${countRes.rows[0].count}`);
  } catch (err) {
    console.error('[DB] Schema setup error:', err);
    throw err;
  }

  isInitialized = true;
}

/**
 * database/migrations/*.sql फाइलहरू क्रमैसँग लागू गर्ने।
 * कुन migration लागू भइसकेको छ भन्ने schema_migrations टेबलमा अभिलेख राखिन्छ,
 * त्यसैले एउटै migration दोहोरिन्न (idempotent) ।
 */
export async function runMigrations(): Promise<void> {
  const migrationsDir = path.resolve(process.cwd(), 'database/migrations');

  if (pool) {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         filename VARCHAR(255) PRIMARY KEY,
         applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
       )`
    );
  } else if (pgliteInstance) {
    await pgliteInstance.exec(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         filename VARCHAR(255) PRIMARY KEY,
         applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
       )`
    );
  }

  if (!fs.existsSync(migrationsDir)) return;

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.toLowerCase().endsWith('.sql'))
    .sort();

  for (const file of files) {
    const appliedRes = pool
      ? await pool.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [file])
      : await pgliteInstance!.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [file]);

    if (appliedRes.rows.length > 0) continue;

    console.log(`[DB] Applying migration: ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

    if (pool) {
      await pool.query(sql);
      await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
    } else if (pgliteInstance) {
      await pgliteInstance.exec(sql);
      await pgliteInstance.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
    }
    console.log(`[DB] Migration applied: ${file}`);
  }
}

export async function query(text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
  if (!isInitialized) {
    await initDb();
  }

  try {
    if (pool) {
      const res = await pool.query(text, params);
      return { rows: res.rows, rowCount: res.rowCount || 0 };
    } else if (pgliteInstance) {
      const res = await pgliteInstance.query(text, params);
      return { rows: res.rows, rowCount: res.rows?.length || 0 };
    }
    throw new Error('Database connection not established');
  } catch (error) {
    console.error('[DB Query Error]', { text, params, error });
    throw error;
  }
}

export async function executeRaw(sqlText: string): Promise<any> {
  if (!isInitialized) {
    await initDb();
  }
  if (pool) {
    return await pool.query(sqlText);
  } else if (pgliteInstance) {
    return await pgliteInstance.exec(sqlText);
  }
}
