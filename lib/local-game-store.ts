import { cleanProfile } from './player-profile';
import { RequestError } from './request-error';
import { BASE_PATH } from './deployment';

type Profile = ReturnType<typeof cleanProfile>;
type Account = { profile: Profile; credential: string; revision: number };
type Store = { version: 1; accounts: Account[] };
const key = 'database-city-local-v1:' + BASE_PATH;
const sessionKey = key + ':session';
function read(): Store {
  try {
    const text = localStorage.getItem(key);
    if (!text) return { version: 1, accounts: [] };
    const store = JSON.parse(text);
    if (store.version !== 1 || !Array.isArray(store.accounts) || !store.accounts.every((a: Account) => a.profile?.username && typeof a.credential === 'string' && Number.isSafeInteger(a.revision))) throw new Error();
    return store;
  } catch { throw new RequestError('อ่านข้อมูลในเครื่องไม่ได้ กรุณาตรวจการอนุญาตจัดเก็บข้อมูลของเบราว์เซอร์', 503); }
}
function write(store: Store) {
  try { localStorage.setItem(key, JSON.stringify(store)); }
  catch { throw new RequestError('บันทึกไม่ได้ พื้นที่ในเบราว์เซอร์อาจเต็มหรือถูกปิดใช้งาน', 503); }
}
const hex = (bytes: Uint8Array) => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
async function credential(password: string, salt: string) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 100000 }, material, 256);
  return salt + ':' + hex(new Uint8Array(bits));
}
const publicPlayer = (account: Account) => ({ ...account.profile, role: 'student', revision: account.revision });
async function request(body?: any): Promise<any> {
  const store = read();
  const username = sessionStorage.getItem(sessionKey);
  const active = store.accounts.find(a => a.profile.username === username);
  if (!body) return { player: active ? publicPlayer(active) : null, accounts: active ? store.accounts.map(a => ({ username: a.profile.username, name: a.profile.name, answerStats: a.profile.answerStats })) : [] };
  if (body.action === 'register' || body.action === 'login') {
    const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!/^[a-z0-9_.-]{1,64}$/.test(username) || !password || password.length > 200) throw new RequestError('กรุณาใช้ชื่อบัญชีภาษาอังกฤษ ตัวเลข . _ - และกรอกรหัสผ่าน');
    let account = store.accounts.find(a => a.profile.username === username);
    if (body.action === 'register') {
      if (account) throw new RequestError('ชื่อบัญชีนี้ถูกใช้งานแล้วในเครื่องนี้', 409);
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (!name || name.length > 100) throw new RequestError('กรุณากรอกชื่อไม่เกิน 100 ตัวอักษร');
      const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
      account = { profile: cleanProfile(body.legacyPlayer || {}, username, name), credential: await credential(password, salt), revision: 0 };
      store.accounts.push(account);
      write(store);
    } else if (!account || await credential(password, account.credential.split(':')[0]) !== account.credential) {
      throw new RequestError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 401);
    }
    sessionStorage.setItem(sessionKey, username);
    return { player: publicPlayer(account!) };
  }
  if (!active) throw new RequestError('กรุณาเข้าสู่ระบบอีกครั้ง', 401);
  if (body.action === 'logout') { sessionStorage.removeItem(sessionKey); return { ok: true }; }
  if (body.action !== 'save') throw new RequestError('คำสั่งไม่ถูกต้อง');
  if (body.revision !== active.revision) throw new RequestError('ข้อมูลถูกแก้ไขจากอีกหน้าต่าง กรุณารีเฟรชก่อนเล่นต่อ', 409);
  const profile = cleanProfile({ ...body.player, weeklyScores: body.player?.weeklyScores ?? active.profile.weeklyScores }, active.profile.username, active.profile.name);
  for (const [week, score] of Object.entries(active.profile.weeklyScores)) {
    const next = profile.weeklyScores[week];
    if (!next || next.correct < score.correct || next.incorrect < score.incorrect) throw new RequestError('คะแนนรายสัปดาห์สะสมต้องไม่ลดลง');
  }
  active.profile = profile;
  active.revision++;
  write(store);
  return { revision: active.revision };
}
export async function localGameRequest(body?: any) {
  // Web Locks serialize account changes across tabs; revision checks detect stale saves.
  if (navigator.locks) return navigator.locks.request(key, () => request(body));
  return request(body);
}
