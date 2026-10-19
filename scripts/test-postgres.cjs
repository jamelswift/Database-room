const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { PGlite } = require('@electric-sql/pglite');
const { NextRequest } = require('next/server');
const root = path.resolve(__dirname, '..');
const sql = new PGlite();
process.env.DATABASE_URL = 'postgresql://embedded-test';
// Exercise actual PostgreSQL SQL in PGlite; only the network transport is replaced.
class TestPool {
  on() { return this; }
  async query(text, values) {
    const result = await sql.query(text, values);
    return { rows: result.rows, rowCount: result.affectedRows ?? result.rows.length };
  }
}
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = new Module(file);
  cache.set(file, module);
  module.filename = file;
  module.paths = Module._nodeModulePaths(path.dirname(file));
  const nativeRequire = module.require.bind(module);
  module.require = name => {
    if (name === 'pg') return { Pool: TestPool };
    if (name.startsWith('@/') || name.startsWith('.')) {
      const target = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name);
      if (fs.existsSync(target + '.ts')) return load(target + '.ts');
    }
    return nativeRequire(name);
  };
  module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, file);
  return module.exports;
}
(async () => {
  await sql.exec(fs.readFileSync(path.join(root, 'database/schema.sql'), 'utf8'));
  const { database } = load(path.join(root, 'lib/database.ts'));
  const { passwordHash, cleanProfile } = load(path.join(root, 'lib/game-store.ts'));
  const route = load(path.join(root, 'app/api/game/route.ts'));
  const teacher = load(path.join(root, 'app/api/teacher/route.ts'));
  let cookie = '';
  async function request(body) {
    const headers = { origin: 'http://localhost:3000', 'content-type': 'application/json', cookie };
    const req = new NextRequest('http://localhost:3000/api/game', body ? { method: 'POST', headers, body: JSON.stringify(body) } : { headers });
    const response = await (body ? route.POST(req) : route.GET(req));
    if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0];
    return { status: response.status, data: await response.json() };
  }
  const registration = await request({ action: 'register', username: 'student', name: "นักเรียน 'ทดสอบ' 🕵️", password: 'test-password', role: 'teacher' });
  assert.equal(registration.status, 200, JSON.stringify(registration.data));
  assert.equal(registration.data.player.role, 'student');
  assert.equal((await request({ action: 'register', username: 'student', name: 'ซ้ำ', password: 'p' })).status, 409);
  assert.equal((await request({ action: 'login', username: 'student', password: 'wrong' })).status, 401);
  const profile = registration.data.player;
  profile.answerStats = { correct: 3, incorrect: 1 };
  profile.weeklyScores = { 1: { correct: 3, incorrect: 1 } };
  profile.completedLevels = [1];
  assert.equal((await request({ action: 'save', player: profile, revision: 0 })).status, 200);
  assert.equal((await request({ action: 'save', player: profile, revision: 0 })).status, 409);
  assert.deepEqual((await request()).data.player.weeklyScores, profile.weeklyScores);
  const teacherRequest = () => teacher.GET(new NextRequest('http://localhost:3000/api/teacher', { headers: { cookie } }));
  assert.equal((await teacherRequest()).status, 403);
  await database.register({ Username: 'teacher', DisplayName: 'ครู', Role: 'teacher', PasswordHash: passwordHash('teacher-test'), ProfileJson: JSON.stringify(cleanProfile({}, 'teacher', 'ครู')), CorrectAnswers: 0, IncorrectAnswers: 0, Revision: 0, UpdatedAt: new Date().toISOString() });
  assert.equal((await request({ action: 'login', username: 'teacher', password: 'teacher-test' })).status, 200);
  const report = await (await teacherRequest()).json();
  assert.equal(report.students.length, 1);
  assert.deepEqual(report.students[0].weeklyScores, profile.weeklyScores);
  assert.ok(!JSON.stringify(report).includes('PasswordHash'));
  const updates = await database.findPlayer('student');
  const results = await Promise.allSettled([database.savePlayer('student', 1, updates), database.savePlayer('student', 1, updates)]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  const oldCookie = cookie;
  await request({ action: 'logout' });
  cookie = oldCookie;
  assert.equal((await request()).data.player, null);
  assert.equal((await database.findPlayer("'; DROP TABLE game_players; --")), undefined);
  console.log('PASS: PostgreSQL schema + adapter + API on PGlite: Thai text, account uniqueness, passwords, sessions/logout, scores, concurrent revisions, teacher access and SQL parameters.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => sql.close());
