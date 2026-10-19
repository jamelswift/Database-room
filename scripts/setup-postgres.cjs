const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const { Client } = require('pg');
const root = path.resolve(__dirname, '..');
const envFile = path.join(root, '.env.local');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

(async () => {
  if (!process.env.DATABASE_ADMIN_URL) throw new Error('Set DATABASE_ADMIN_URL privately before setup');
  const admin = new Client({ connectionString: process.env.DATABASE_ADMIN_URL, connectionTimeoutMillis: 5000 });
  const databaseName = 'database_city';
  const roleName = 'database_city_app';
  let applicationUrl = process.env.DATABASE_URL;
  await admin.connect();
  try {
    const existing = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
    if (!existing.rowCount) {
      const role = await admin.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [roleName]);
      if (role.rowCount) throw new Error('Application role already exists; configure DATABASE_URL rather than changing its password');
      const password = randomBytes(32).toString('hex');
      // Identifiers are fixed; generated password contains only hex characters.
      await admin.query(`CREATE ROLE ${roleName} LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE`);
      await admin.query(`CREATE DATABASE ${databaseName}`);
      const url = new URL(process.env.DATABASE_ADMIN_URL);
      url.username = roleName;
      url.password = password;
      url.pathname = '/' + databaseName;
      applicationUrl = url.toString();
      const previous = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf8') : '';
      const retained = previous.split(/\r?\n/).filter(line => !/^(DATABASE_URL|NEXT_PUBLIC_LOCAL_MODE|NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)=/.test(line)).join('\n');
      fs.writeFileSync(envFile, retained + '\nDATABASE_URL=' + applicationUrl + '\nNEXT_PUBLIC_LOCAL_MODE=false\n', { mode: 0o600 });
    }
  } finally { await admin.end(); }
  if (!applicationUrl) throw new Error('Database exists. Configure its DATABASE_URL privately; existing credentials were not changed.');
  const url = new URL(process.env.DATABASE_ADMIN_URL);
  url.pathname = '/' + databaseName;
  const owner = new Client({ connectionString: url.toString(), connectionTimeoutMillis: 5000 });
  await owner.connect();
  try {
    await owner.query('BEGIN');
    await owner.query(fs.readFileSync(path.join(root, 'database/schema.sql'), 'utf8'));
    await owner.query(`GRANT CONNECT ON DATABASE ${databaseName} TO ${roleName}`);
    await owner.query(`GRANT USAGE ON SCHEMA public TO ${roleName}`);
    await owner.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON game_players, game_sessions TO ${roleName}`);
    await owner.query('COMMIT');
  } catch (error) { await owner.query('ROLLBACK'); throw error; }
  finally { await owner.end(); }
  const app = new Client({ connectionString: applicationUrl, connectionTimeoutMillis: 5000 });
  await app.connect();
  try {
    const result = await app.query('SELECT count(*)::int AS count FROM game_players');
    console.log('PostgreSQL ready: database_city; tables game_players and game_sessions; accounts:', result.rows[0].count);
    console.log('Application connection saved privately in .env.local.');
  } finally { await app.end(); }
})().catch(error => { console.error('PostgreSQL setup failed:', error.code || error.message); process.exitCode = 1; });
