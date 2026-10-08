import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { cleanProfile, findPlayer, newSession, passwordHash, passwordMatches, publicPlayer, RequestError, sessionPlayer, tokenHash } from '@/lib/game-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const cookieName = 'database_city_session';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

function failure(error: unknown) {
  if (error instanceof RequestError) return json({ error: error.message }, error.status);
  if (error instanceof Error && error.message.includes('REVISION_CONFLICT')) return json({ error: 'ข้อมูลถูกแก้ไขจากอีกหน้าต่าง กรุณารีเฟรชก่อนเล่นต่อ' }, 409);
  if (error && typeof error === 'object' && 'code' in error && error.code === 'DUPLICATE_PLAYER') return json({ error: 'ชื่อบัญชีนี้ถูกใช้งานแล้ว' }, 409);
  console.error('Game database request failed');
  return json({ error: 'เชื่อมต่อฐานข้อมูลไม่ได้ กรุณาลองอีกครั้ง' }, 503);
}

export async function GET(request: NextRequest) {
  try {
    const row = await sessionPlayer(request.cookies.get(cookieName)?.value);
    if (!row) return json({ player: null, accounts: [] });
    const ranking = await database.listPlayers();
    return json({ player: publicPlayer(row), accounts: ranking.map(account => ({ username: account.Username, name: account.DisplayName, answerStats: { correct: account.CorrectAnswers, incorrect: account.IncorrectAnswers } })) });
  } catch (error) { return failure(error); }
}

export async function POST(request: NextRequest) {
  try {
    if (request.headers.get('origin') !== request.nextUrl.origin) throw new RequestError('คำขอไม่ถูกต้อง', 403);
    const text = await request.text();
    if (Buffer.byteLength(text) > 32768) throw new RequestError('ข้อมูลมีขนาดใหญ่เกินไป', 413);
    let body;
    try { body = JSON.parse(text); } catch { throw new RequestError('ข้อมูลไม่ถูกต้อง'); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new RequestError('ข้อมูลไม่ถูกต้อง');
    if (body.action === 'login' || body.action === 'register') {
      const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      if (!/^[a-z0-9_.-]{1,64}$/.test(username) || !password || password.length > 200) throw new RequestError('กรุณาใช้ชื่อบัญชีภาษาอังกฤษ ตัวเลข . _ - และกรอกรหัสผ่าน');
      let row = await findPlayer(username);
      if (body.action === 'register') {
        if (row) throw new RequestError('ชื่อบัญชีนี้ถูกใช้งานแล้ว', 409);
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        if (!name || name.length > 100) throw new RequestError('กรุณากรอกชื่อไม่เกิน 100 ตัวอักษร');
        const profile = cleanProfile(body.legacyPlayer || {}, username, name);
        await database.register({ Username: username, DisplayName: name, PasswordHash: passwordHash(password), ProfileJson: JSON.stringify(profile), CorrectAnswers: profile.answerStats.correct, IncorrectAnswers: profile.answerStats.incorrect, Revision: 0, UpdatedAt: new Date().toISOString() });
        row = await findPlayer(username);
      } else if (!row || !passwordMatches(password, row.PasswordHash)) {
        throw new RequestError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 401);
      }
      const token = await newSession(username);
      const response = json({ player: publicPlayer(row!) });
      response.cookies.set(cookieName, token, { httpOnly: true, sameSite: 'lax', secure: request.nextUrl.protocol === 'https:', path: '/', maxAge: 7 * 86400 });
      return response;
    }
    const token = request.cookies.get(cookieName)?.value;
    const row = await sessionPlayer(token);
    if (!row) throw new RequestError('กรุณาเข้าสู่ระบบอีกครั้ง', 401);
    if (body.action === 'logout') {
      await database.revokeSession(tokenHash(token!));
      const response = json({ ok: true });
      response.cookies.set(cookieName, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
      return response;
    }
    if (body.action !== 'save') throw new RequestError('คำสั่งไม่ถูกต้อง');
    if (!Number.isInteger(body.revision)) throw new RequestError('เวอร์ชันข้อมูลไม่ถูกต้อง');
    const previous = cleanProfile(JSON.parse(row.ProfileJson), row.Username, row.DisplayName);
    const profile = cleanProfile({ ...body.player, weeklyScores: body.player?.weeklyScores ?? previous.weeklyScores }, row.Username, row.DisplayName);
    for (const [week, score] of Object.entries(previous.weeklyScores)) {
      const next = profile.weeklyScores[week];
      if (!next || next.correct < score.correct || next.incorrect < score.incorrect) throw new RequestError('คะแนนรายสัปดาห์สะสมต้องไม่ลดลง');
    }
    await database.savePlayer(row.Username, body.revision, { ProfileJson: JSON.stringify(profile), CorrectAnswers: profile.answerStats.correct, IncorrectAnswers: profile.answerStats.incorrect, UpdatedAt: new Date().toISOString() });
    return json({ revision: body.revision + 1 });
  } catch (error) { return failure(error); }
}
