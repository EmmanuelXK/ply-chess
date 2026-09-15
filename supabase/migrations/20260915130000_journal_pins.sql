-- Player journal pins. RLS: each signed-in user can only touch their own rows.
-- Authorization uses auth.uid() only — never raw_user_meta_data.

create table if not exists public.journal_pins (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  opening_id text not null,
  opening_name text not null default '',
  trap_id text,
  ply int not null default 0,
  fen text not null,
  pgn text not null default '',
  mode text not null default 'learn',
  coach_kind text not null default '',
  coach_text text not null default '',
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_pins_user_created
  on public.journal_pins (user_id, created_at desc);

alter table public.journal_pins enable row level security;

drop policy if exists journal_pins_own on public.journal_pins;
create policy journal_pins_own
  on public.journal_pins
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
