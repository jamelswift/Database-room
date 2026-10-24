const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
for (const name of ['.env.local', '.env']) {
  const filename = path.join(root, name);
  if (fs.existsSync(filename)) process.loadEnvFile(filename);
}
if (process.env.DATABASE_URL && !['localhost', '127.0.0.1', '[::1]'].includes(new URL(process.env.DATABASE_URL).hostname)) {
  console.log('Using configured remote PostgreSQL for development.');
} else {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts/local-postgres.cjs')], { cwd: root, env: process.env, stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
