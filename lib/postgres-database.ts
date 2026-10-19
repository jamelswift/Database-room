import { Pool } from 'pg';
import type { PlayerRow } from './database';

const globalDatabase = globalThis as typeof globalThis & { gamePostgresPool?: Pool };
function pool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL_NOT_CONFIGURED');
  if (!globalDatabase.gamePostgresPool) {
    globalDatabase.gamePostgresPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000 });
    globalDatabase.gamePostgresPool.on('error', () => console.error('PostgreSQL idle connection failed'));
  }
  return globalDatabase.gamePostgresPool;
}
const columns = '"Username", "DisplayName", "Role", "PasswordHash", "ProfileJson"::text AS "ProfileJson", "CorrectAnswers", "IncorrectAnswers", "Revision", "UpdatedAt"';
function player(row: any): PlayerRow | undefined {
  return row ? { ...row, UpdatedAt: new Date(row.UpdatedAt).toISOString() } : undefined;
}
export const postgresDatabase = {
  async findPlayer(username: string) {
    const result = await pool().query(`SELECT ${columns} FROM game_players WHERE "Username" = $1`, [username]);
    return player(result.rows[0]);
  },
  async listPlayers() {
    return (await pool().query('SELECT "Username", "DisplayName", "CorrectAnswers", "IncorrectAnswers" FROM game_players ORDER BY "Username"')).rows;
  },
  async studentRecords() {
    return (await pool().query(`SELECT ${columns} FROM game_players WHERE "Role" = 'student' ORDER BY "Username"`)).rows.map(row => {
      const { Username, DisplayName, ProfileJson, CorrectAnswers, IncorrectAnswers, UpdatedAt } = player(row)!;
      return { Username, DisplayName, ProfileJson, CorrectAnswers, IncorrectAnswers, UpdatedAt };
    });
  },
  async register(row: PlayerRow) {
    try {
      await pool().query(`INSERT INTO game_players ("Username", "DisplayName", "Role", "PasswordHash", "ProfileJson", "CorrectAnswers", "IncorrectAnswers", "Revision", "UpdatedAt") VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9)`,
        [row.Username, row.DisplayName, row.Role || 'student', row.PasswordHash, row.ProfileJson, row.CorrectAnswers, row.IncorrectAnswers, row.Revision, row.UpdatedAt]);
    } catch (error) {
      if ((error as { code?: string }).code === '23505') throw Object.assign(new Error('DUPLICATE_PLAYER'), { code: 'DUPLICATE_PLAYER' });
      throw error;
    }
  },
  async sessionPlayer(hash: string) {
    const result = await pool().query(`SELECT ${columns} FROM game_players WHERE "Username" = (SELECT "Username" FROM game_sessions WHERE "TokenHash" = $1 AND "ExpiresAt" > now())`, [hash]);
    return player(result.rows[0]) ?? null;
  },
  async createSession(session: { TokenHash: string; Username: string; ExpiresAt: string }) {
    await pool().query('DELETE FROM game_sessions WHERE "ExpiresAt" <= now()');
    await pool().query('INSERT INTO game_sessions ("TokenHash", "Username", "ExpiresAt") VALUES ($1,$2,$3)', [session.TokenHash, session.Username, session.ExpiresAt]);
  },
  async revokeSession(hash: string) {
    await pool().query('DELETE FROM game_sessions WHERE "TokenHash" = $1', [hash]);
  },
  async savePlayer(username: string, revision: number, updates: Pick<PlayerRow, 'ProfileJson' | 'CorrectAnswers' | 'IncorrectAnswers' | 'UpdatedAt'>) {
    const result = await pool().query(`UPDATE game_players SET "ProfileJson" = $3::jsonb, "CorrectAnswers" = $4, "IncorrectAnswers" = $5, "UpdatedAt" = $6, "Revision" = "Revision" + 1 WHERE "Username" = $1 AND "Revision" = $2`,
      [username, revision, updates.ProfileJson, updates.CorrectAnswers, updates.IncorrectAnswers, updates.UpdatedAt]);
    if (result.rowCount !== 1) throw new Error('REVISION_CONFLICT');
  },
};
