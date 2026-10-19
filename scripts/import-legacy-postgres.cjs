const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
const root = path.resolve(__dirname, '..');
process.loadEnvFile(path.join(root, '.env.local'));
(async () => {
  const source = path.resolve(root, process.env.GAME_DATABASE_PATH || 'data/game-database.json');
  if (!fs.existsSync(source)) return console.log('No legacy accounts to import.');
  const store = JSON.parse(fs.readFileSync(source, 'utf8'));
  if (store.version !== 1 || !Array.isArray(store.players)) throw new Error('Invalid legacy store');
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE game_players IN EXCLUSIVE MODE');
    if ((await client.query('SELECT count(*)::int AS count FROM game_players')).rows[0].count) {
      await client.query('ROLLBACK');
      return console.log('Import skipped: target has accounts; existing accounts unchanged.');
    }
    for (const row of store.players) {
      const profile = JSON.parse(row.ProfileJson);
      if (!profile || Array.isArray(profile) || typeof profile !== 'object' || typeof row.PasswordHash !== 'string') throw new Error('Invalid legacy player');
      await client.query('INSERT INTO game_players ("Username","DisplayName","Role","PasswordHash","ProfileJson","CorrectAnswers","IncorrectAnswers","Revision","UpdatedAt") VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9)', [row.Username,row.DisplayName,row.Role || 'student',row.PasswordHash,row.ProfileJson,row.CorrectAnswers,row.IncorrectAnswers,row.Revision,row.UpdatedAt]);
    }
    await client.query('COMMIT');
    console.log('Imported legacy accounts:', store.players.length, '(source retained; sign in again)');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { await client.end(); }
})().catch(error => { console.error('Import failed:', error.code || error.message); process.exitCode = 1; });
