-- V1 — Launch with personal Profiles v1.0
-- Apply on a dedicated Opening Edge Supabase project.
-- RLS: each signed-in user can only touch their own rows.
-- Authorization uses auth.uid() only — never raw_user_meta_data.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  initials text not null default '',
  side_pref text not null default 'both'
    check (side_pref in ('white', 'black', 'both')),
  club_tag text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opening_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  opening_id text not null,
  seen int not null default 0,
  best int not null default 0,
  last_at timestamptz not null default now(),
  primary key (user_id, opening_id)
);

create table if not exists public.opening_reps (
  user_id uuid not null references auth.users (id) on delete cascade,
  opening_id text not null,
  ply int not null,
  due timestamptz not null,
  ease double precision not null default 2.3,
  streak int not null default 0,
  primary key (user_id, opening_id, ply)
);

alter table public.profiles enable row level security;
alter table public.opening_progress enable row level security;
alter table public.opening_reps enable row level security;

create policy "profiles_own"
  on public.profiles
  for all
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "progress_own"
  on public.opening_progress
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "reps_own"
  on public.opening_reps
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, initials)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'Club player'),
    upper(left(coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'OE'), 2))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();
