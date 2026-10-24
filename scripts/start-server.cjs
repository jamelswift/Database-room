const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { Client } = require('pg');
const root = path.resolve(__dirname, '..');

(async () => {
  for (const name of ['.env.local', '.env']) {
    const envFile = path.join(root, name);
    if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
  }
  if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL to the PostgreSQL connection URL in the service environment.');
  if (process.env.NEXT_PUBLIC_LOCAL_MODE === 'true') throw new Error('Rebuild with NEXT_PUBLIC_LOCAL_MODE=false for server deployment.');
  const client = new Client({ connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(74291305)');
    const tables = await client.query("SELECT to_regclass('game_players') AS players, to_regclass('game_sessions') AS sessions");
    if (!tables.rows[0].players || !tables.rows[0].sessions) {
      await client.query(fs.readFileSync(path.join(root, 'database/schema.sql'), 'utf8'));
    }
    await client.query('SELECT "Username" FROM game_players LIMIT 0');
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { await client.end(); }
  console.log('PostgreSQL connected; starting web server.');
  const server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '--hostname', '0.0.0.0', '--port', process.env.PORT || '3000', ...process.argv.slice(2)], { cwd: root, env: process.env, stdio: 'inherit', windowsHide: true });
  server.on('error', () => { console.error('Failed to start Next.js'); process.exitCode = 1; });
  server.on('exit', code => { process.exitCode = code ?? 1; });
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.kill(signal));
})().catch(error => {
  console.error('Web startup failed:', error.code || error.message);
  process.exitCode = 1;
});
