import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const connectionString = 'postgresql://postgres.fvsjnbczmqmyxzdlnwri:Up%40dhyaya1%23@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';
  
  console.log('Connecting to Supabase PostgreSQL...');
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected!');

  const executeFile = async (filePath: string) => {
    console.log(`Executing ${filePath}...`);
    const sql = fs.readFileSync(filePath, 'utf8');
    await client.query(sql);
    console.log(`Finished ${filePath}`);
  };

  try {
    await executeFile(path.join(__dirname, 'database', 'schema.sql'));
    await executeFile(path.join(__dirname, 'database', 'seed.sql'));
    
    // Migrations
    const migrationsDir = path.join(__dirname, 'database', 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
      for (const file of files) {
        await executeFile(path.join(migrationsDir, file));
      }
    }
    
    console.log('All migrations completed successfully.');
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

main();
