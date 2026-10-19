// Build a static copy without moving the original server API routes.
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
(async () => {
  const envFile = path.join(root, '.env.local');
  if (require('node:fs').existsSync(envFile)) process.loadEnvFile(envFile);
  if (Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) !== Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) throw new Error('Both Supabase URL and publishable key are required');
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  if (publicKey.startsWith('sb_secret_')) throw new Error('Never publish a Supabase secret key');
  if (publicKey.split('.').length === 3) {
    const claims = JSON.parse(Buffer.from(publicKey.split('.')[1], 'base64url').toString('utf8'));
    if (claims.role === 'service_role') throw new Error('Never publish a Supabase service_role key');
  }
  const stage = await fs.mkdtemp(path.join(root, '.pages-build-'));
  const relative = path.relative(root, stage);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Build directory must stay within the workspace');
  for (const entry of ['app', 'components', 'lib', 'public', 'package.json', 'tsconfig.json', 'next-env.d.ts', 'next.config.mjs', 'postcss.config.mjs']) {
    await fs.cp(path.join(root, entry), path.join(stage, entry), { recursive: true, filter: source => source !== path.join(root, 'app', 'api') });
  }
  await fs.symlink(path.join(root, 'node_modules'), path.join(stage, 'node_modules'), 'junction');
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/Database-room';
  if (!basePath.startsWith('/') || !/^[A-Za-z0-9_.-]+$/.test(basePath.slice(1))) throw new Error('Expected a single repository base path');
  const result = spawnSync(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'build', ...(process.argv.includes('--webpack') ? ['--webpack'] : [])], {
    cwd: stage, stdio: 'inherit',
    env: { ...process.env, NEXT_PUBLIC_LOCAL_MODE: 'true', NEXT_PUBLIC_BASE_PATH: basePath, PAGES_BUILD_ROOT: root },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
  const outputDirectory = path.join(root, 'out');
  try {
    const resolvedOutput = await fs.realpath(outputDirectory);
    if (path.relative(root, resolvedOutput) !== 'out') throw new Error('Output directory must resolve to this workspace out/');
    // Keep a reversible backup while replacing obsolete generated chunks.
    await fs.rename(outputDirectory, path.join(stage, 'previous-out'));
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await fs.cp(path.join(stage, 'out'), outputDirectory, { recursive: true, force: true });
  await fs.writeFile(path.join(root, 'out', '.nojekyll'), '');
  const html = await fs.readFile(path.join(root, 'out', 'index.html'), 'utf8');
  if (!html.includes(basePath + '/_next/')) throw new Error('Missing repository asset prefix');
  await fs.access(path.join(root, 'out', 'audio', 'city-theme.wav'));
  await fs.access(path.join(root, 'out', 'database-london-atlas.png'));
  console.log('GitHub Pages files ready in out/ with base path ' + basePath);
})().catch(error => { console.error(error); process.exitCode = 1; });
