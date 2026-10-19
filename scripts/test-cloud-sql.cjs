const { PGlite } = require('@electric-sql/pglite');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const db = await PGlite.create();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role bypassrls; create schema auth; grant usage on schema auth to authenticated, anon; create table auth.users(id uuid primary key, raw_user_meta_data jsonb, email text); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid; $$; create publication supabase_realtime;");
    const sql = fs.readFileSync(path.join(__dirname, '../supabase/setup.sql'), 'utf8');
    await db.exec(sql);
    await db.exec(sql); // Setup can be safely reapplied.
    const alice = '00000000-0000-0000-0000-000000000001';
    const bob = '00000000-0000-0000-0000-000000000002';
    const teacher = '00000000-0000-0000-0000-000000000003';
    for (const [id, username] of [[alice, 'alice'], [bob, 'bob'], [teacher, 'teacher']]) await db.query('insert into auth.users(id, raw_user_meta_data, email) values($1, $2, $3)', [id, JSON.stringify(username === 'teacher' ? {} : { username, display_name: username, role: 'teacher' }), username + '@database-city.invalid']);
    assert.ok((await db.query('select role from public.game_profiles')).rows.every(row => row.role === 'student'));
    await db.query("update public.game_profiles set role = 'teacher' where id = $1", [teacher]);
    const login = async (id, role = 'authenticated') => {
      await db.exec('reset role;');
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
      await db.exec('set role ' + role);
    };
    await login(alice);
    assert.equal((await db.query('select username from public.game_profiles')).rows.length, 1);
    assert.equal((await db.query('select public.is_game_teacher() as teacher')).rows[0].teacher, false);
    await assert.rejects(db.query("update public.game_profiles set role = 'teacher'"), error => error.code === '42501');
    await assert.rejects(db.query("insert into public.game_profiles(id, username, display_name) values($1, 'hacker', 'hacker')", ['00000000-0000-0000-0000-000000000004']), error => error.code === '42501');
    const profile = { username: 'bob', name: 'Impersonation', role: 'teacher', password: 'never-persist', xp: 99999, coins: 99999, level: 16, answerStats: { correct: 2, incorrect: 1 }, weeklyScores: { 1: { correct: 2, incorrect: 1 } }, completedLevels: [1] };
    const save = (value, revision) => db.query('select public.save_game_profile($1::jsonb, $2) as revision', [JSON.stringify(value), revision]);
    assert.equal((await save(profile, 0)).rows[0].revision, 1);
    const stored = (await db.query('select profile,role from public.game_profiles')).rows[0];
    assert.equal(stored.profile.username, 'alice');
    assert.equal(stored.profile.name, 'alice');
    assert.equal(stored.role, 'student');
    assert.equal(stored.profile.role, undefined);
    assert.equal(stored.profile.password, undefined);
    assert.equal(stored.profile.xp, 100);
    await assert.rejects(save(profile, 0), error => error.code === 'P0002');
    await assert.rejects(save({ ...profile, weeklyScores: {} }, 1));
    await assert.rejects(save({ ...profile, answerStats: { correct: 1, incorrect: 1 } }, 1));
    await assert.rejects(save({ ...profile, weeklyScores: { 17: { correct: 1, incorrect: 0 } } }, 1));
    await assert.rejects(save({ ...profile, completedLevels: [1, 3] }, 1));
    await assert.rejects(save({ ...profile, weeklyScores: { 1: { correct: null, incorrect: 1 } } }, 1));
    await login(bob);
    assert.equal((await db.query('select username from public.game_profiles')).rows[0].username, 'bob');
    await login(teacher);
    assert.equal((await db.query('select public.is_game_teacher() as teacher')).rows[0].teacher, true);
    assert.equal((await db.query("select username from public.game_profiles where role = 'student'")).rows.length, 2);
    await login('', 'anon');
    await assert.rejects(db.query('select * from public.game_profiles'), error => error.code === '42501');
    await assert.rejects(save(profile, 0), error => error.code === '42501');
    await db.exec('reset role');
    assert.equal((await db.query("select count(*)::int as count from pg_publication_tables where pubname='supabase_realtime' and tablename='game_profiles'")).rows[0].count, 1);
    console.log('PASS: PostgreSQL schema, student isolation, protected teacher role, teacher reports, authenticated saves, revisions, score validation and realtime publication');
  } finally { await db.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
