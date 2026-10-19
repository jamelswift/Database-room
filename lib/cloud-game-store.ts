import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabase-client';
import { cleanProfile } from './player-profile';
import { RequestError } from './request-error';
import type { StudentReport } from './weekly-scores';

type CloudRow = { id: string; username: string; display_name: string; role: 'teacher' | 'student'; profile: any; revision: number; updated_at: string };
export const publicCloudPlayer = (row: CloudRow) => ({ ...cleanProfile(row.profile, row.username, row.display_name), role: row.role, revision: row.revision });
function fail(error: any): never {
  if (error?.code === 'P0002') throw new RequestError('ข้อมูลถูกแก้ไขจากอีกหน้าต่าง กรุณารีเฟรชก่อนเล่นต่อ', 409);
  if (error?.code === '23505') throw new RequestError('ชื่อบัญชีนี้ถูกใช้งานแล้ว', 409);
  if (error?.code === 'invalid_credentials') throw new RequestError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 401);
  if (error?.code === 'email_not_confirmed') throw new RequestError('บัญชียังไม่พร้อมใช้งาน กรุณาให้ครูตรวจการตั้งค่าบัญชี', 401);
  if (error?.code === 'user_already_exists') throw new RequestError('ชื่อบัญชีนี้ถูกใช้งานแล้ว', 409);
  if (error?.status === 429) throw new RequestError('ส่งคำขอบ่อยเกินไป กรุณารอสักครู่', 429);
  throw new RequestError(error?.message || 'เชื่อมต่อฐานข้อมูลออนไลน์ไม่ได้ กรุณาลองอีกครั้ง', error?.status || 503);
}
async function currentRow(client: SupabaseClient) {
  const { data: { session }, error } = await client.auth.getSession();
  if (error) fail(error);
  if (!session) return null;
  const result = await client.from('game_profiles').select('*').eq('id', session.user.id).single();
  if (result.error) fail(result.error);
  return result.data as CloudRow;
}
export async function cloudGameRequest(body?: any, client = getSupabase()): Promise<any> {
  if (body?.action === 'login' || body?.action === 'register') {
    const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!/^[a-z0-9_.-]{1,64}$/.test(username) || !password || password.length > 200) throw new RequestError('กรุณากรอกชื่อบัญชีภาษาอังกฤษและรหัสผ่าน');
    const email = username + '@database-city.invalid';
    if (body.action === 'register') {
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (!name || name.length > 100) throw new RequestError('กรุณากรอกชื่อไม่เกิน 100 ตัวอักษร');
      if (password.length < 6) throw new RequestError('กรุณาตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษร');
      const result = await client.auth.signUp({ email, password, options: { data: { username, display_name: name } } });
      if (result.error) fail(result.error);
      if (!result.data.session) throw new RequestError('บัญชียังไม่พร้อมใช้งาน กรุณาให้ผู้ดูแลปิด Confirm email สำหรับระบบบัญชีนักเรียน', 503);
    } else {
      const result = await client.auth.signInWithPassword({ email, password });
      if (result.error) fail(result.error);
    }
    const row = await currentRow(client);
    if (!row) throw new RequestError('กรุณาเข้าสู่ระบบอีกครั้ง', 401);
    return { player: publicCloudPlayer(row) };
  }
  const row = await currentRow(client);
  if (!body) {
    if (!row) return { player: null, accounts: [] };
    const player = publicCloudPlayer(row);
    return { player, accounts: row.role === 'student' ? [{ username: player.username, name: player.name, answerStats: player.answerStats }] : [] };
  }
  if (!row) throw new RequestError('กรุณาเข้าสู่ระบบอีกครั้ง', 401);
  if (body.action === 'logout') {
    const result = await client.auth.signOut({ scope: 'local' });
    if (result.error) fail(result.error);
    return { ok: true };
  }
  if (body.action !== 'save') throw new RequestError('คำสั่งไม่ถูกต้อง');
  const profile = cleanProfile(body.player, row.username, row.display_name);
  const result = await client.rpc('save_game_profile', { p_profile: profile, p_revision: body.revision });
  if (result.error) fail(result.error);
  return { revision: result.data };
}
export async function cloudTeacherReport(client = getSupabase()): Promise<{ students: StudentReport[] }> {
  const teacher = await currentRow(client);
  if (!teacher) throw new RequestError('กรุณาเข้าสู่ระบบ', 401);
  if (teacher.role !== 'teacher') throw new RequestError('เฉพาะบัญชีครูเท่านั้น', 403);
  const records: CloudRow[] = [];
  for (let offset = 0; ; offset += 500) {
    const result = await client.from('game_profiles').select('*').eq('role', 'student').order('username').range(offset, offset + 499);
    if (result.error) fail(result.error);
    const page = result.data as CloudRow[];
    records.push(...page);
    if (page.length < 500) break;
  }
  return { students: records.map(row => {
    const player = publicCloudPlayer(row);
    const assigned = Object.values(player.weeklyScores).reduce((sum, score) => sum + score.correct + score.incorrect, 0);
    return { username: player.username, name: player.name, completedLevels: player.completedLevels, answerStats: player.answerStats, weeklyScores: player.weeklyScores, unassignedAnswers: player.answerStats.correct + player.answerStats.incorrect - assigned, updatedAt: row.updated_at };
  }) };
}
