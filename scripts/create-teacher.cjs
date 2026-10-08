const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { randomBytes } = require('node:crypto');
const root = path.resolve(__dirname, '..');
process.chdir(root);
if (fs.existsSync(path.join(root, '.env.local'))) process.loadEnvFile(path.join(root, '.env.local'));
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = new Module(file);
  cache.set(file, module);
  module.filename = file;
  module.paths = Module._nodeModulePaths(path.dirname(file));
  const originalRequire = module.require.bind(module);
  module.require = name => {
    if (name.startsWith('.')) {
      const target = path.resolve(path.dirname(file), name) + '.ts';
      if (fs.existsSync(target)) return load(target);
    }
    return originalRequire(name);
  };
  module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, file);
  return module.exports;
}
(async () => {
  const { database } = load(path.join(root, 'lib/database.ts'));
  const { cleanProfile, passwordHash } = load(path.join(root, 'lib/game-store.ts'));
  const username = process.argv[2] || 'teacher';
  if (!/^[a-z0-9_.-]{1,64}$/.test(username)) throw new Error('Invalid username');
  if (await database.findPlayer(username)) throw new Error('Account already exists; password unchanged');
  const password = randomBytes(15).toString('base64url');
  const name = 'ครู';
  await database.register({ Username: username, DisplayName: name, Role: 'teacher', PasswordHash: passwordHash(password), ProfileJson: JSON.stringify(cleanProfile({}, username, name)), CorrectAnswers: 0, IncorrectAnswers: 0, Revision: 0, UpdatedAt: new Date().toISOString() });
  console.log(JSON.stringify({ username, password, role: 'teacher' }));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
