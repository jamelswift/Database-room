const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const data = path.join(root, 'data', 'postgres');
const bin = process.env.POSTGRES_BIN || 'C:/Program Files/PostgreSQL/18/bin';
const privateEnv = path.join(root, '.env.postgres.local');
function run(executable, args, options = {}) {
  const result = spawnSync(executable, args, { cwd: root, windowsHide: true, encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'PostgreSQL command failed');
  return result;
}
async function start() {
  if (!fs.existsSync(path.join(bin, 'pg_ctl.exe'))) throw new Error('PostgreSQL not found; set POSTGRES_BIN');
  if (!fs.existsSync(path.join(data, 'PG_VERSION'))) {
    fs.mkdirSync(data, { recursive: true });
    if (fs.readdirSync(data).length) throw new Error('PostgreSQL directory is not empty; initialization stopped');
    const password = randomBytes(32).toString('hex');
    // Keep the initialization password outside PGDATA so initdb sees an empty directory.
    const temporary = path.join(root, 'data', 'postgres-init-password.tmp');
    fs.writeFileSync(temporary, password, { mode: 0o600, flag: 'wx' });
    try {
      run(path.join(bin, 'initdb.exe'), ['-D', data, '-U', 'postgres', '--pwfile=' + temporary, '--auth=scram-sha-256', '--encoding=UTF8', '--locale=C']);
    } finally { fs.unlinkSync(temporary); }
    fs.appendFileSync(path.join(data, 'postgresql.conf'), "\nlisten_addresses = '127.0.0.1'\nport = 5433\n");
    fs.writeFileSync(privateEnv, 'DATABASE_ADMIN_URL=postgresql://postgres:' + password + '@127.0.0.1:5433/postgres\n', { mode: 0o600, flag: 'wx' });
  }
  if (!fs.existsSync(privateEnv)) throw new Error('Local PostgreSQL administrator configuration missing');
  process.loadEnvFile(privateEnv);
  const { Client } = require('pg');
  const probe = new Client({ connectionString: process.env.DATABASE_ADMIN_URL, connectionTimeoutMillis: 2000 });
  try { await probe.connect(); }
  catch (error) {
    if (error.code !== 'ECONNREFUSED') throw error;
    run(path.join(bin, 'pg_ctl.exe'), ['-D', data, '-l', path.join(data, 'server.log'), '-w', 'start'], { stdio: 'ignore', timeout: 20000 });
  } finally { await probe.end(); }
  run(process.execPath, [path.join(root, 'scripts/setup-postgres.cjs')], { stdio: 'inherit', env: process.env });
  console.log('Local PostgreSQL ready on 127.0.0.1:5433');
}
try {
  if (process.argv[2] === 'stop') {
    run(path.join(bin, 'pg_ctl.exe'), ['-D', data, '-m', 'fast', '-w', 'stop']);
    console.log('Project PostgreSQL stopped.');
  } else start().catch(error => { console.error(error.message); process.exitCode = 1; });
} catch (error) { console.error(error.message); process.exitCode = 1; }
