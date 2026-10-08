import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { database } from './database';

import { RequestError } from './request-error';
export { RequestError } from './request-error';
export { cleanProfile } from './player-profile';
export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export function passwordHash(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function passwordMatches(password: string, encoded: string) {
  const [salt, hash] = encoded.split(':');
  if (!salt || !hash || hash.length !== 128) return false;
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, 'hex'));
}

export async function findPlayer(username: string) {
  return database.findPlayer(username);
}
export function publicPlayer(row: Record<string, any>) {
  return { ...JSON.parse(row.ProfileJson), role: row.Role || 'student', username: row.Username, name: row.DisplayName, answerStats: { correct: row.CorrectAnswers, incorrect: row.IncorrectAnswers }, revision: row.Revision };
}
export async function sessionPlayer(token: string | undefined) {
  if (!token) return null;
  return database.sessionPlayer(tokenHash(token));
}
export async function newSession(username: string) {
  const token = randomBytes(32).toString('hex');
  await database.createSession({ TokenHash: tokenHash(token), Username: username, ExpiresAt: new Date(Date.now() + 7 * 86400000).toISOString() });
  return token;
}
