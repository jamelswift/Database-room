const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = new Module(file);
  cache.set(file, module);
  module.filename = file;
  module.paths = Module._nodeModulePaths(path.dirname(file));
  const original = module.require.bind(module);
  module.require = name => {
    const target = name.startsWith('@/') ? path.join(root, name.slice(2)) : name.startsWith('.') ? path.resolve(path.dirname(file), name) : null;
    return target && fs.existsSync(target + '.ts') ? load(target + '.ts') : original(name);
  };
  module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
  return module.exports;
}
(async () => {
  const { cleanProfile } = load(path.join(root, 'lib/player-profile.ts'));
  const { completePlayerLevel } = load(path.join(root, 'lib/player-progress.ts'));
  const { cloudGameRequest: api, cloudTeacherReport } = load(path.join(root, 'lib/cloud-game-store.ts'));
  const { subscribeTeacherScores } = load(path.join(root, 'lib/teacher-realtime.ts'));
  const makeRow = (id, role) => ({ id, role, username: id, display_name: id, profile: cleanProfile({}, id, id), revision: 0, updated_at: '2026-10-09T00:00:00Z' });
  const rows = [makeRow('alice', 'student'), makeRow('bob', 'student'), makeRow('teacher', 'teacher')];
  let session = null;
  let rpcError = null;
  let saved;
  let signupInput;
  const client = {
    auth: {
      getSession: async () => ({ data: { session }, error: null }),
      signInWithPassword: async ({ email, password }) => {
        if (password !== 'correct') return { error: { code: 'invalid_credentials' } };
        session = { user: { id: email.split('@')[0] } };
        return { error: null };
      },
      signUp: async input => {
        signupInput = input;
        const id = input.options.data.username;
        rows.push(makeRow(id, 'student'));
        session = { user: { id } };
        return { data: { session }, error: null };
      },
      signOut: async () => { session = null; return { error: null }; },
    },
    from: () => {
      const filters = [];
      const query = {
        select: () => query, eq: (key, value) => { filters.push([key, value]); return query; }, order: () => query, range: () => query,
        result: () => ({ data: rows.filter(row => filters.every(([key, value]) => row[key] === value)), error: null }),
        single: async () => ({ ...query.result(), data: query.result().data[0] }),
        then: (resolve, reject) => Promise.resolve(query.result()).then(resolve, reject),
      };
      return query;
    },
    rpc: async (_name, params) => { saved = params; return { data: params.p_revision + 1, error: rpcError }; },
  };
  assert.equal((await api(undefined, client)).player, null);
  await assert.rejects(api({ action: 'login', username: 'alice', password: 'wrong' }, client), e => e.status === 401);
  const player = (await api({ action: 'login', username: 'alice', password: 'correct' }, client)).player;
  assert.equal(player.role, 'student');
  assert.equal(player.password, undefined);
  await assert.rejects(cloudTeacherReport(client), e => e.status === 403);
  player.weeklyScores = { 1: { correct: 1, incorrect: 0 } };
  player.answerStats = { correct: 1, incorrect: 0 };
  const completed = completePlayerLevel(player, 1);
  assert.equal(completed.weeklyScores[1].correct, 1);
  assert.equal(completed.answerStats.correct, 1);
  assert.equal(completed.xp, 100);
  assert.equal(completePlayerLevel(completed, 1).xp, 100);
  assert.equal((await api({ action: 'save', player: { ...completed, username: 'bob', role: 'teacher' }, revision: 0 }, client)).revision, 1);
  assert.equal(saved.p_profile.username, 'alice');
  assert.equal(saved.p_profile.role, undefined);
  assert.equal(saved.p_profile.weeklyScores[1].correct, 1);
  rpcError = { code: 'P0002' };
  await assert.rejects(api({ action: 'save', player: completed, revision: 0 }, client), e => e.status === 409);
  rpcError = null;
  await api({ action: 'login', username: 'teacher', password: 'correct' }, client);
  const report = await cloudTeacherReport(client);
  assert.equal(report.students.length, 2);
  assert.ok(report.students.every(student => student.username !== 'teacher'));
  await api({ action: 'register', username: 'NEW', password: 'correct', name: 'นักเรียน', role: 'teacher' }, client);
  assert.equal(signupInput.email, 'new@database-city.invalid');
  assert.equal(signupInput.options.data.role, undefined);
  assert.equal((await api(undefined, client)).player.role, 'student');
  await api({ action: 'logout' }, client);
  assert.equal((await api(undefined, client)).player, null);
  let changeCallback, statusCallback, subscriptionFilter;
  let refreshes = 0;
  let removed = false;
  const statuses = [];
  const channel = { on: (event, filter, callback) => { assert.equal(event, 'postgres_changes'); subscriptionFilter = filter; changeCallback = callback; return channel; }, subscribe: callback => { statusCallback = callback; return channel; } };
  const cleanup = subscribeTeacherScores(() => refreshes++, status => statuses.push(status), { channel: () => channel, removeChannel: async actual => { assert.equal(actual, channel); removed = true; } });
  assert.equal(subscriptionFilter.table, 'game_profiles');
  statusCallback('SUBSCRIBED');
  changeCallback({ eventType: 'UPDATE' });
  statusCallback('CHANNEL_ERROR');
  statusCallback('SUBSCRIBED');
  assert.deepEqual(statuses, ['connecting', 'live', 'reconnecting', 'live']);
  assert.equal(refreshes, 3);
  cleanup();
  assert.equal(removed, true);
  console.log('PASS: cloud account flow, teacher-only reports, score adapter, final-answer preservation, realtime changes and reconnect snapshots (mock client)');
  const result = spawnSync(process.execPath, [path.join(__dirname, 'test-cloud-sql.cjs')], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status) process.exitCode = result.status;
})().catch(error => { console.error(error); process.exitCode = 1; });
