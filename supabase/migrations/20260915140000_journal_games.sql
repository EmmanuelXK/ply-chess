-- Spar games pinned to an opening/line. Existing moment-pins stay kind=moment.
-- Authorization still uses auth.uid() only via journal_pins_own.

alter table public.journal_pins
  add column if not exists kind text not null default 'moment',
  add column if not exists start_fen text not null default '',
  add column if not exists result text not null default '*',
  add column if not exists moves jsonb not null default '[]'::jsonb;

update public.journal_pins
  set start_fen = fen
  where start_fen = '' and fen <> '';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'journal_pins_kind_check'
  ) then
    alter table public.journal_pins
      add constraint journal_pins_kind_check
      check (kind = any (array['moment'::text, 'game'::text]));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'journal_pins_result_check'
  ) then
    alter table public.journal_pins
      add constraint journal_pins_result_check
      check (result = any (array['1-0'::text, '0-1'::text, '1/2-1/2'::text, '*'::text]));
  end if;
end $$;

create index if not exists journal_pins_user_opening_line
  on public.journal_pins (user_id, opening_id, trap_id, created_at desc);
