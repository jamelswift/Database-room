-- Run once in the Supabase SQL Editor before registering players.
begin;
create table if not exists public.game_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_.-]{1,64}$'),
  display_name text not null check (length(display_name) between 1 and 100),
  role text not null default 'student' check (role in ('student', 'teacher')),
  profile jsonb not null default '{}'::jsonb check (jsonb_typeof(profile) = 'object'),
  revision integer not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now()
);
alter table public.game_profiles enable row level security;
revoke all on public.game_profiles from anon, authenticated;
grant select on public.game_profiles to authenticated;
grant all on public.game_profiles to service_role;

create or replace function public.is_game_teacher()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.game_profiles where id = auth.uid() and role = 'teacher'); $$;
revoke all on function public.is_game_teacher() from public, anon;
grant execute on function public.is_game_teacher() to authenticated;
drop policy if exists game_read_self_or_teacher on public.game_profiles;
create policy game_read_self_or_teacher on public.game_profiles for select to authenticated
using (id = (select auth.uid()) or (select public.is_game_teacher()));

create or replace function public.create_game_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.game_profiles(id, username, display_name, role)
  values(new.id, lower(trim(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)))),
    trim(coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))), 'student');
  return new;
end; $$;
revoke all on function public.create_game_profile() from public, anon, authenticated;
drop trigger if exists create_database_city_profile on auth.users;
create trigger create_database_city_profile after insert on auth.users for each row execute function public.create_game_profile();

-- RPC is the only student write path. Auth identity and role are never taken from client JSON.
create or replace function public.save_game_profile(p_profile jsonb, p_revision integer)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  previous public.game_profiles%rowtype;
  entry record;
  score jsonb;
  correct_total integer;
  incorrect_total integer;
  weekly_correct integer := 0;
  weekly_incorrect integer := 0;
  count_levels integer;
  idx integer;
  normalized jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select * into previous from public.game_profiles where id = auth.uid() for update;
  if not found then raise exception 'Profile not found' using errcode = '42501'; end if;
  if p_revision is null or p_revision <> previous.revision then raise exception 'REVISION_CONFLICT' using errcode = 'P0002'; end if;
  if p_profile is null or jsonb_typeof(p_profile) <> 'object' or octet_length(p_profile::text) > 32768 then raise exception 'Invalid profile'; end if;
  if jsonb_typeof(p_profile -> 'answerStats') is distinct from 'object'
     or jsonb_typeof(p_profile -> 'weeklyScores') is distinct from 'object'
     or jsonb_typeof(p_profile -> 'completedLevels') is distinct from 'array' then raise exception 'Invalid scores'; end if;
  if jsonb_typeof(p_profile #> '{answerStats,correct}') is distinct from 'number'
     or jsonb_typeof(p_profile #> '{answerStats,incorrect}') is distinct from 'number'
     or (p_profile #>> '{answerStats,correct}') !~ '^[0-9]{1,7}$'
     or (p_profile #>> '{answerStats,incorrect}') !~ '^[0-9]{1,7}$' then raise exception 'Invalid totals'; end if;
  correct_total := (p_profile #>> '{answerStats,correct}')::integer;
  incorrect_total := (p_profile #>> '{answerStats,incorrect}')::integer;
  if correct_total > 1000000 or incorrect_total > 1000000
    or correct_total < coalesce((previous.profile #>> '{answerStats,correct}')::integer, 0)
    or incorrect_total < coalesce((previous.profile #>> '{answerStats,incorrect}')::integer, 0) then raise exception 'Totals cannot decrease'; end if;
  for entry in select * from jsonb_each(p_profile -> 'weeklyScores') loop
    score := entry.value;
    if entry.key !~ '^([1-9]|1[0-6])$' or jsonb_typeof(score) <> 'object'
      or jsonb_typeof(score -> 'correct') is distinct from 'number'
      or jsonb_typeof(score -> 'incorrect') is distinct from 'number'
      or (score ->> 'correct') !~ '^[0-9]{1,7}$'
      or (score ->> 'incorrect') !~ '^[0-9]{1,7}$' then raise exception 'Invalid weekly scores'; end if;
    if (score ->> 'correct')::integer > 1000000 or (score ->> 'incorrect')::integer > 1000000 then raise exception 'Score exceeds maximum'; end if;
    weekly_correct := weekly_correct + (score ->> 'correct')::integer;
    weekly_incorrect := weekly_incorrect + (score ->> 'incorrect')::integer;
  end loop;
  if weekly_correct > correct_total or weekly_incorrect > incorrect_total then raise exception 'Weekly scores exceed totals'; end if;
  for entry in select * from jsonb_each(coalesce(previous.profile -> 'weeklyScores', '{}'::jsonb)) loop
    score := p_profile -> 'weeklyScores' -> entry.key;
    if score is null or (score ->> 'correct')::integer < (entry.value ->> 'correct')::integer
      or (score ->> 'incorrect')::integer < (entry.value ->> 'incorrect')::integer then raise exception 'Weekly scores cannot decrease'; end if;
  end loop;
  count_levels := jsonb_array_length(p_profile -> 'completedLevels');
  if count_levels > 16 then raise exception 'Invalid levels'; end if;
  if count_levels > 0 then
    for idx in 0..count_levels - 1 loop
      if (p_profile -> 'completedLevels' -> idx) <> to_jsonb(idx + 1) then raise exception 'Levels must be sequential'; end if;
    end loop;
  end if;
  if count_levels < coalesce(jsonb_array_length(previous.profile -> 'completedLevels'), 0) then raise exception 'Levels cannot decrease'; end if;
  normalized := (p_profile - 'password' - 'role' - 'revision') || jsonb_build_object(
    'username', previous.username, 'name', previous.display_name,
    'level', least(16, count_levels + 1), 'xp', count_levels * 100, 'coins', 100 + count_levels * 35);
  update public.game_profiles set profile = normalized, revision = revision + 1, updated_at = clock_timestamp()
  where id = auth.uid();
  return previous.revision + 1;
end; $$;
revoke all on function public.save_game_profile(jsonb, integer) from public, anon;
grant execute on function public.save_game_profile(jsonb, integer) to authenticated;

-- Enable database change events for the teacher subscription.
do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'game_profiles') then
    alter publication supabase_realtime add table public.game_profiles;
  end if;
end; $$;
commit;
