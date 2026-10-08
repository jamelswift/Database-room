// Build a static copy without moving the original server API routes.
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
(async () => {
  const stage = await fs.mkdtemp(path.join(root, '.pages-build-'));
  const relative = path.relative(root, stage);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Build directory must stay within the workspace');
  for (const entry of ['app', 'components', 'lib', 'public', 'package.json', 'tsconfig.json', 'next-env.d.ts', 'next.config.mjs', 'postcss.config.mjs']) {
    await fs.cp(path.join(root, entry), path.join(stage, entry), { recursive: true, filter: source => source !== path.join(root, 'app', 'api') });
  }
  await fs.symlink(path.join(root, 'node_modules'), path.join(stage, 'node_modules'), 'junction');
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/Database-room';
  if (!basePath.startsWith('/') || !/^[A-Za-z0-9_.-]+$/.test(basePath.slice(1))) throw new Error('Expected a single repository base path');
  const result = spawnSync(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'build'], {
    cwd: stage, stdio: 'inherit',
    env: { ...process.env, NEXT_PUBLIC_LOCAL_MODE: 'true', NEXT_PUBLIC_BASE_PATH: basePath, PAGES_BUILD_ROOT: root },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
  await fs.cp(path.join(stage, 'out'), path.join(root, 'out'), { recursive: true, force: true });
  await fs.writeFile(path.join(root, 'out', '.nojekyll'), '');
  const html = await fs.readFile(path.join(root, 'out', 'index.html'), 'utf8');
  if (!html.includes(basePath + '/_next/')) throw new Error('Missing repository asset prefix');
  await fs.access(path.join(root, 'out', 'audio', 'city-theme.wav'));
  await fs.access(path.join(root, 'out', 'database-london-atlas.png'));
  console.log('GitHub Pages files ready in out/ with base path ' + basePath);
})().catch(error => { console.error(error); process.exitCode = 1; });
