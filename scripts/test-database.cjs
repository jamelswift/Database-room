const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { NextRequest } = require('next/server');
const root = path.resolve(__dirname, '..');
const os = require('node:os');
const testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'database-city-test-'));
process.env.GAME_DATABASE_PATH = path.join(testDirectory, 'game.json');
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (file === path.join(root, 'lib/database.ts')) return { database: load(path.join(root, 'lib/file-database.ts')).fileDatabase };
  if (cache.has(file)) return cache.get(file).exports;
  const module = new Module(file);
  cache.set(file, module);
  module.filename = file;
  module.paths = Module._nodeModulePaths(path.dirname(file));
  const originalRequire = module.require.bind(module);
  module.require = name => {
    if (name.startsWith('@/') || name.startsWith('.')) {
      const target = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name);
      if (fs.existsSync(`${target}.ts`)) return load(`${target}.ts`);
    }
    return originalRequire(name);
  };
  module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, file);
  return module.exports;
}

(async () => {
  const route = load(path.join(root, 'app/api/game/route.ts'));
  const teacherRoute = load(path.join(root, 'app/api/teacher/route.ts'));
  const { database } = load(path.join(root, 'lib/database.ts'));
  const { passwordHash, cleanProfile } = load(path.join(root, 'lib/game-store.ts'));
  let cookie = '';
  async function request(body, options = {}) {
    const headers = { origin: 'http://localhost:3000', 'content-type': 'application/json', cookie, ...options.headers };
    const req = new NextRequest('http://localhost:3000/api/game', body ? { method: 'POST', headers, body: JSON.stringify(body) } : { headers });
    const response = await (body ? route.POST(req) : route.GET(req));
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) cookie = setCookie.split(';')[0];
    return { response, data: await response.json() };
  }
  assert.equal((await request()).data.player, null);
  const teacherRequest = (sessionCookie = cookie) => teacherRoute.GET(new NextRequest('http://localhost:3000/api/teacher', { headers: { cookie: sessionCookie } }));
  assert.equal((await teacherRequest()).status, 401);
  assert.equal((await request({ action: 'save' })).response.status, 401);
  assert.equal((await request({ action: 'register', username: 'bad', password: 'p', name: 'bad' }, { headers: { origin: 'https://other.example' } })).response.status, 403);
  const registration = await request({ action: 'register', username: 'Test.Student', name: "นักสืบ 'ทดสอบ' 🕵️", password: 'test-password', role: 'teacher' });
  assert.equal(registration.response.status, 200, JSON.stringify(registration.data));
  assert.ok(registration.response.headers.get('set-cookie').includes('HttpOnly'));
  let player = registration.data.player;
  assert.equal(player.name, "นักสืบ 'ทดสอบ' 🕵️");
  assert.equal(player.password, undefined);
  assert.equal(player.username, 'test.student');
  assert.equal(player.role, 'student');
  assert.equal((await teacherRequest()).status, 403);
  assert.equal((await request({ action: 'register', username: 'TEST.STUDENT', name: 'duplicate', password: 'p' })).response.status, 409);
  assert.equal((await request({ action: 'login', username: 'test.student', password: 'wrong' })).response.status, 401);
  player.answerStats = { correct: 8, incorrect: 2 };
  player.weeklyScores = { 1: { correct: 3, incorrect: 1 } };
  player.role = 'teacher';
  player.completedLevels = [1];
  player.character.hat = 'headband';
  player.character.skin = '#c68642';
  const saved = await request({ action: 'save', player, revision: 0 });
  assert.equal(saved.response.status, 200, JSON.stringify(saved.data));
  assert.equal(saved.data.revision, 1);
  assert.equal((await request({ action: 'save', player, revision: 0 })).response.status, 409);
  const loaded = (await request()).data;
  assert.equal(loaded.player.answerStats.correct, 8);
  assert.equal(loaded.player.xp, 100);
  assert.equal(loaded.player.role, 'student');
  assert.deepEqual(loaded.player.weeklyScores, { 1: { correct: 3, incorrect: 1 } });
  assert.equal((await teacherRequest()).status, 403);
  assert.equal((await request({ action: 'save', player: { ...player, weeklyScores: { 17: { correct: 1, incorrect: 0 } } }, revision: 1 })).response.status, 400);
  assert.equal((await request({ action: 'save', player: { ...player, weeklyScores: { 1: { correct: 9, incorrect: 1 } } }, revision: 1 })).response.status, 400);
  assert.equal((await request({ action: 'save', player: { ...player, weeklyScores: {} }, revision: 1 })).response.status, 400);
  assert.equal(loaded.player.character.hat, 'headband');
  assert.equal(loaded.player.character.skin, '#c68642');
  assert.equal(loaded.accounts[0].password, undefined);
  assert.equal(loaded.accounts[0].PasswordHash, undefined);
  assert.equal(loaded.accounts[0].answerStats.incorrect, 2);
  assert.equal((await request({ action: 'save', player: { ...player, completedLevels: [16] }, revision: 1 })).response.status, 400);
  const stored = await database.findPlayer('test.student');
  assert.notEqual(stored.PasswordHash, 'test-password');
  assert.match(stored.PasswordHash, /^[a-f0-9]{32}:[a-f0-9]{128}$/);
  const oldCookie = cookie;
  assert.equal((await request({ action: 'logout' })).response.status, 200);
  assert.equal((await request(undefined, { headers: { cookie: oldCookie } })).data.player, null);
  const login = await request({ action: 'login', username: 'TEST.STUDENT', password: 'test-password' });
  assert.equal(login.response.status, 200);
  assert.equal(login.data.player.answerStats.correct, 8);
  const imported = await request({ action: 'register', username: 'legacy', name: 'ข้อมูลเดิม', password: 'legacy-password', legacyPlayer: { completedLevels: [1, 2], answerStats: { correct: 17, incorrect: 3 } } });
  assert.equal(imported.response.status, 200);
  assert.equal(imported.data.player.xp, 200);
  assert.equal(imported.data.player.answerStats.correct, 17);
  assert.equal((await request()).data.accounts.length, 2);
  const { scoresCsv } = load(path.join(root, 'lib/sheets-export.ts'));
  const exported = scoresCsv((await request()).data.accounts);
  assert.ok(exported.startsWith('\uFEFFUsername,DisplayName,'));
  assert.ok(exported.includes('test.student'));
  assert.ok(exported.includes(',8,2,10,80\r\n'));
  assert.ok(!exported.includes('PasswordHash'));
  assert.ok(!exported.includes('test-password'));
  assert.ok(!exported.includes('TokenHash'));
  const escaped = scoresCsv([{ username: 'test', name: '=1+1,"quoted"\nnext', answerStats: { correct: 0, incorrect: 0 } }]);
  assert.ok(escaped.includes('"\'=1+1,""quoted""\nnext"'));
  assert.ok(escaped.endsWith(',0,0,0,\r\n'));
  assert.equal(scoresCsv([]), '\uFEFFUsername,DisplayName,CorrectAnswers,IncorrectAnswers,TotalAnswers,AccuracyPercent\r\n');
  const compiledDatabase = path.join(testDirectory, 'database.cjs');
  fs.writeFileSync(compiledDatabase, ts.transpileModule(fs.readFileSync(path.join(root, 'lib/file-database.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText);
  const execFile = require('node:util').promisify(require('node:child_process').execFile);
  const runChild = code => execFile(process.execPath, ['-e', code], { env: process.env });
  const prelude = `const assert = require('node:assert/strict'); const { fileDatabase: database } = require(${JSON.stringify(compiledDatabase)});`;
  await runChild(prelude + "database.findPlayer('test.student').then(p => { assert.equal(p.CorrectAnswers, 8); assert.equal(p.Revision, 1); }).catch(e => { console.error(e); process.exitCode = 1; });");
  const base = await database.findPlayer('test.student');
  await Promise.all(Array.from({ length: 4 }, (_, i) => runChild(prelude + `database.register(${JSON.stringify({ ...base, Username: `parallel-${i}` })}).catch(e => { console.error(e); process.exitCode = 1; });`)));
  assert.equal((await database.listPlayers()).length, 6);
  await database.register({ Username: 'teacher-test', DisplayName: 'Teacher', Role: 'teacher', PasswordHash: passwordHash('teacher-test-password'), ProfileJson: JSON.stringify(cleanProfile({}, 'teacher-test', 'Teacher')), CorrectAnswers: 0, IncorrectAnswers: 0, Revision: 0, UpdatedAt: new Date().toISOString() });
  assert.equal((await request({ action: 'login', username: 'teacher-test', password: 'teacher-test-password' })).response.status, 200);
  const reportResponse = await teacherRequest();
  assert.equal(reportResponse.status, 200);
  const report = await reportResponse.json();
  assert.equal(report.students.length, 6);
  assert.ok(!report.students.some(s => s.username === 'teacher-test'));
  const studentReport = report.students.find(s => s.username === 'test.student');
  assert.deepEqual(studentReport.weeklyScores, { 1: { correct: 3, incorrect: 1 } });
  assert.deepEqual(studentReport.completedLevels, [1]);
  assert.equal(studentReport.unassignedAnswers, 6);
  assert.deepEqual(report.students.find(s => s.username === 'legacy').weeklyScores, {});
  assert.equal(report.students.find(s => s.username === 'legacy').unassignedAnswers, 20);
  assert.ok(!JSON.stringify(report).includes('PasswordHash'));
  assert.ok(!JSON.stringify(report).includes('TokenHash'));
  assert.ok(!JSON.stringify(report).includes('ProfileJson'));
  const { weeklyScoresCsv } = load(path.join(root, 'lib/sheets-export.ts'));
  const weeklyCsv = weeklyScoresCsv(report.students, 16);
  assert.equal(weeklyCsv.split('\r\n').length, 98);
  assert.ok(weeklyCsv.includes('"test.student-week-1"'));
  assert.ok(weeklyCsv.includes(',1,3,1,4,75,TRUE,'));
  assert.ok(weeklyCsv.includes(',2,,,,,FALSE,'));
  const { weeklyChartData } = load(path.join(root, 'lib/weekly-scores.ts'));
  const chart = weeklyChartData([
    { ...studentReport, weeklyScores: { 1: { correct: 1, incorrect: 0 } }, completedLevels: [1] },
    { ...studentReport, weeklyScores: { 1: { correct: 9, incorrect: 1 }, 3: { correct: 0, incorrect: 0 } }, completedLevels: [] },
  ], 16);
  assert.equal(chart.length, 16);
  assert.deepEqual(chart[0], { week: 1, correct: 10, incorrect: 1, recorded: 2, completed: 1, total: 11, accuracy: 90.91 });
  assert.equal(chart[1].accuracy, null);
  assert.equal(chart[1].recorded, 0);
  assert.equal(chart[2].recorded, 1);
  assert.equal(chart[2].accuracy, null);
  assert.equal(weeklyChartData([], 16)[0].accuracy, null);
  const { allWeeksTotals } = load(path.join(root, 'lib/weekly-scores.ts'));
  const totalChart = allWeeksTotals([
    { ...studentReport, username: 'a', weeklyScores: { 1: { correct: 2, incorrect: 1 }, 2: { correct: 6, incorrect: 1 } } },
    { ...studentReport, username: 'b', weeklyScores: {} },
  ], 16);
  assert.deepEqual(totalChart[0], { username: 'a', name: studentReport.name, correct: 8, incorrect: 2, total: 10, recorded: true, accuracy: 80 });
  assert.equal(totalChart[1].recorded, false);
  assert.equal(totalChart[1].accuracy, null);
  assert.deepEqual(allWeeksTotals([], 16), []);
  await request({ action: 'logout' });
  assert.equal((await teacherRequest()).status, 401);
  const competing = await Promise.allSettled([
    database.savePlayer('test.student', 1, { ...base, CorrectAnswers: 20 }),
    database.savePlayer('test.student', 1, { ...base, CorrectAnswers: 30 }),
  ]);
  assert.equal(competing.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(competing.filter(r => r.status === 'rejected').length, 1);
  const validFile = fs.readFileSync(process.env.GAME_DATABASE_PATH, 'utf8');
  fs.writeFileSync(process.env.GAME_DATABASE_PATH, '{broken');
  await assert.rejects(database.register({ ...base, Username: 'corruption-test' }));
  assert.equal(fs.readFileSync(process.env.GAME_DATABASE_PATH, 'utf8'), '{broken');
  assert.equal(fs.existsSync(process.env.GAME_DATABASE_PATH + '.lock'), false);
  fs.writeFileSync(process.env.GAME_DATABASE_PATH, validFile);
  assert.equal((await database.listPlayers()).length, 7);
  console.log('PASS: custom file storage, Thai/emoji, registration, duplicate accounts, password hashing, login, session revocation, CSRF, save/reload, revision conflict, profile validation, ranking, legacy import.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  fs.rmSync(testDirectory, { recursive: true, force: true });
});
