const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = new Module(file);
  cache.set(file, module);
  module.filename = file;
  module.paths = Module._nodeModulePaths(path.dirname(file));
  const nativeRequire = module.require.bind(module);
  module.require = name => name.startsWith('.')
    ? load(path.resolve(path.dirname(file), `${name}.ts`)) : nativeRequire(name);
  module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, file);
  return module.exports;
}

const { cleanProfile } = load(path.join(__dirname, '../lib/game-store.ts'));
const { CURRICULUM_MAP_NODES: nodes } = load(path.join(__dirname, '../components/access-curriculum.ts'));
// Check progression through the final teaching week and exclude exam stages.
for (const completed of [8, 15, 16]) {
  const levels = Array.from({ length: completed }, (_, index) => index + 1);
  const profile = cleanProfile({ completedLevels: levels }, 'student', 'Student');
  assert.deepEqual(profile.completedLevels, levels);
  assert.equal(profile.level, Math.min(completed + 1, 16));
  assert.equal(profile.xp, completed * 100);
  assert.equal(profile.maxXp, 1600);
}
assert.throws(() => cleanProfile({ completedLevels: [1, 16] }, 'student', 'Student'));
assert.equal(nodes.length, 16);
for (const [i, node] of nodes.entries()) {
  assert.equal(node.level, i + 1);
  assert.ok(node.knowledge && node.skill && node.attitude && node.evidence && node.assessment);
  assert.ok(node.steps.length >= 2 && node.lessons.length >= 2);
  assert.equal(node.options.length, 4);
  assert.ok(node.options[node.correctIndex]);
  // Each map card is 286 x 166, centered at its node.
  assert.ok(node.x >= 143 && node.x <= 1600 - 143);
  assert.ok(node.y >= 83 && node.y <= 900 - 83);
  for (const other of nodes.slice(i + 1)) {
    assert.ok(Math.abs(node.x - other.x) >= 286 || Math.abs(node.y - other.y) >= 166);
  }
}
assert.ok(nodes.every(node => !/กลางภาค|ปลายภาค/.test(node.subtitle)));
assert.equal(nodes[8].subtitle, 'Select Query');
assert.match(nodes[15].subtitle, /Switchboard/);
console.log('PASS: 16 teaching weeks, exam exclusion, progression, assessment fields, quiz options and map spacing.');
