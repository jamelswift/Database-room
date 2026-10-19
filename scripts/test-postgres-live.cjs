const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { Client } = require('pg');
process.loadEnvFile('.env.local');
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const username = 'connection-test-' + randomBytes(8).toString('hex');
const password = randomBytes(24).toString('hex');
const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
let cookie = '';
async function request(body) {
  const response = await fetch(base + '/api/game', body ? { method: 'POST', headers: { origin: base, 'content-type': 'application/json', cookie }, body: JSON.stringify(body) } : { headers: { cookie } });
  if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0];
  return { status: response.status, data: await response.json() };
}
(async () => {
  await client.connect();
  try {
    const registration = await request({ action: 'register', username, password, name: 'ทดสอบการเชื่อมต่อ' });
    assert.equal(registration.status, 200, JSON.stringify(registration.data));
    const player = registration.data.player;
    player.answerStats = { correct: 3, incorrect: 1 };
    player.weeklyScores = { 1: { correct: 3, incorrect: 1 } };
    player.completedLevels = [1];
    assert.equal((await request({ action: 'save', player, revision: 0 })).status, 200);
    const stored = (await client.query('SELECT "ProfileJson", "CorrectAnswers", "Revision" FROM game_players WHERE "Username"=$1', [username])).rows[0];
    assert.equal(stored.CorrectAnswers, 3);
    assert.equal(stored.Revision, 1);
    assert.deepEqual(stored.ProfileJson.weeklyScores, player.weeklyScores);
    assert.equal((await request({ action: 'save', player, revision: 0 })).status, 409);
    await request({ action: 'logout' });
    assert.equal((await request()).data.player, null);
    const login = await request({ action: 'login', username, password });
    assert.equal(login.status, 200);
    assert.deepEqual(login.data.player.weeklyScores, player.weeklyScores);
    await request({ action: 'logout' });
    console.log('PASS: live website registration, PostgreSQL persistence, scores, revision conflict, logout and login.');
  } finally {
    await client.query('DELETE FROM game_players WHERE "Username"=$1', [username]);
    await client.end();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
