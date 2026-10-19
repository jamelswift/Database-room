import { mkdir, open, readFile, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';


export type PlayerRow = {
  Role?: 'teacher' | 'student';
  Username: string; DisplayName: string; PasswordHash: string; ProfileJson: string;
  CorrectAnswers: number; IncorrectAnswers: number; Revision: number; UpdatedAt: string;
};
type SessionRow = { TokenHash: string; Username: string; ExpiresAt: string };
type Store = { version: 1; players: PlayerRow[]; sessions: SessionRow[] };

function validate(value: any): asserts value is Store {
  const valid = value?.version === 1 && Array.isArray(value.players) && Array.isArray(value.sessions)
    && value.players.every((p: any) => p && ['Username', 'DisplayName', 'PasswordHash', 'ProfileJson', 'UpdatedAt'].every(k => typeof p[k] === 'string')
      && ['CorrectAnswers', 'IncorrectAnswers', 'Revision'].every(k => Number.isSafeInteger(p[k]) && p[k] >= 0)
      && Number.isFinite(Date.parse(p.UpdatedAt)) && (p.Role === undefined || p.Role === 'teacher' || p.Role === 'student'))
    && value.sessions.every((s: any) => s && ['TokenHash', 'Username', 'ExpiresAt'].every(k => typeof s[k] === 'string') && Number.isFinite(Date.parse(s.ExpiresAt)))
    && new Set(value.players.map((p: PlayerRow) => p.Username)).size === value.players.length
    && new Set(value.sessions.map((s: SessionRow) => s.TokenHash)).size === value.sessions.length
    && value.sessions.every((s: SessionRow) => value.players.some((p: PlayerRow) => p.Username === s.Username));
  if (!valid) throw new Error('DATABASE_CORRUPT');
  for (const player of value.players) {
    const profile = JSON.parse(player.ProfileJson);
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) throw new Error('DATABASE_CORRUPT');
  }
}

// Each operation reloads the file under an exclusive filesystem lock, including
// across Node processes. A crash leaves the lock in place: fail closed instead
// of stealing a possibly active writer's lock.
async function transaction<T>(write: boolean, action: (store: Store) => T): Promise<T> {
  // Runtime data is created on the persistent host, never bundled into builds.
  const filename = path.resolve(/* turbopackIgnore: true */ process.env.GAME_DATABASE_PATH || 'data/game-database.json');
  const publicDirectory = path.resolve('public');
  const relative = path.relative(publicDirectory, filename);
  if (!relative || (!relative.startsWith('..' + path.sep) && !path.isAbsolute(relative))) throw new Error('DATABASE_PATH_MUST_BE_PRIVATE');
  await mkdir(path.dirname(filename), { recursive: true });
  const lockname = filename + '.lock';
  const deadline = Date.now() + 10000;
  let lock;
  while (!lock) {
    try { lock = await open(/* turbopackIgnore: true */ lockname, 'wx', 0o600); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      if (Date.now() >= deadline) throw new Error('DATABASE_LOCK_TIMEOUT');
      await new Promise(resolve => setTimeout(resolve, 25));
    }
  }
  let temporary: string | undefined;
  try {
    let store: Store;
    try {
      store = JSON.parse(await readFile(/* turbopackIgnore: true */ filename, 'utf8'));
      validate(store);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      store = { version: 1, players: [], sessions: [] };
    }
    const result = action(store);
    if (write) {
      validate(store);
      temporary = filename + '.' + randomUUID() + '.tmp';
      const file = await open(/* turbopackIgnore: true */ temporary, 'wx', 0o600);
      try { await file.writeFile(JSON.stringify(store), 'utf8'); await file.sync(); }
      finally { await file.close(); }
      await rename(temporary, filename);
      temporary = undefined;
    }
    return result;
  } finally {
    if (temporary) await unlink(temporary).catch(() => {});
    await lock.close();
    await unlink(lockname);
  }
}

export const fileDatabase = {
  findPlayer(username: string) {
    return transaction(false, store => store.players.find(p => p.Username === username));
  },
  listPlayers() {
    return transaction(false, store => store.players.map(({ Username, DisplayName, CorrectAnswers, IncorrectAnswers }) => ({ Username, DisplayName, CorrectAnswers, IncorrectAnswers })));
  },
  studentRecords() {
    return transaction(false, store => store.players.filter(p => p.Role !== 'teacher').map(({ Username, DisplayName, ProfileJson, CorrectAnswers, IncorrectAnswers, UpdatedAt }) => ({ Username, DisplayName, ProfileJson, CorrectAnswers, IncorrectAnswers, UpdatedAt })));
  },
  register(player: PlayerRow) {
    return transaction(true, store => {
      if (store.players.some(p => p.Username === player.Username)) throw Object.assign(new Error('DUPLICATE_PLAYER'), { code: 'DUPLICATE_PLAYER' });
      store.players.push(player);
    });
  },
  sessionPlayer(hash: string) {
    return transaction(false, store => {
      const session = store.sessions.find(s => s.TokenHash === hash && Date.parse(s.ExpiresAt) > Date.now());
      return session ? store.players.find(p => p.Username === session.Username) ?? null : null;
    });
  },
  createSession(session: SessionRow) {
    return transaction(true, store => {
      store.sessions = store.sessions.filter(s => Date.parse(s.ExpiresAt) > Date.now());
      store.sessions.push(session);
    });
  },
  revokeSession(hash: string) {
    return transaction(true, store => { store.sessions = store.sessions.filter(s => s.TokenHash !== hash); });
  },
  savePlayer(username: string, revision: number, updates: Pick<PlayerRow, 'ProfileJson' | 'CorrectAnswers' | 'IncorrectAnswers' | 'UpdatedAt'>) {
    return transaction(true, store => {
      const player = store.players.find(p => p.Username === username);
      if (!player || player.Revision !== revision) throw new Error('REVISION_CONFLICT');
      Object.assign(player, updates, { Revision: revision + 1 });
    });
  },
};



