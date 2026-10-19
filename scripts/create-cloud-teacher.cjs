// Run only on your private computer; privileged keys never enter browser builds.
const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const { createClient } = require('@supabase/supabase-js');
const root = path.resolve(__dirname, '..');
for (const name of ['.env.local', '.env.teacher.local']) {
  const filename = path.join(root, name);
  if (fs.existsSync(filename)) process.loadEnvFile(filename);
}
(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in private .env.local first');
  const username = process.argv[2] || process.env.CLOUD_TEACHER_USERNAME || 'teacher';
  if (!/^[a-z0-9_.-]{1,64}$/.test(username)) throw new Error('Invalid teacher username');
  const password = process.env.CLOUD_TEACHER_PASSWORD || randomBytes(15).toString('base64url');
  const client = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.admin.createUser({ email: username + '@database-city.invalid', password, email_confirm: true, user_metadata: { username, display_name: 'ครู' } });
  if (error) throw new Error('Teacher was not created: ' + error.message + '. Existing accounts are never promoted or reset automatically.');
  const promoted = await client.from('game_profiles').update({ role: 'teacher' }).eq('id', data.user.id).select('id,role').single();
  if (promoted.error || promoted.data?.role !== 'teacher') throw new Error('Account created but teacher permission could not be granted. Check the SQL setup and promote this user manually in the Supabase dashboard.');
  console.log(JSON.stringify({ username, password, role: 'teacher' }));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
