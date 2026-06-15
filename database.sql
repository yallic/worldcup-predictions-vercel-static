create extension if not exists pgcrypto;

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  display_name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.participants
drop column if exists pin_salt,
drop column if exists pin_hash;

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  external_fixture_id integer,
  api_provider text,
  stage text not null default 'Grup',
  home_team text not null,
  away_team text not null,
  venue text,
  kickoff_at timestamptz not null,
  locked_at timestamptz not null,
  home_score integer,
  away_score integer,
  status text not null default 'scheduled' check (status in ('scheduled', 'finished')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.matches
add column if not exists external_fixture_id integer,
add column if not exists api_provider text,
add column if not exists venue text,
add column if not exists last_synced_at timestamptz;

create unique index if not exists matches_unique_fixture_idx
on public.matches (stage, home_team, away_team, kickoff_at);

create unique index if not exists matches_external_fixture_id_idx
on public.matches (external_fixture_id);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  home_score integer not null check (home_score >= 0),
  away_score integer not null check (away_score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (participant_id, match_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists matches_set_updated_at on public.matches;
create trigger matches_set_updated_at
before update on public.matches
for each row
execute function public.set_updated_at();

drop trigger if exists predictions_set_updated_at on public.predictions;
create trigger predictions_set_updated_at
before update on public.predictions
for each row
execute function public.set_updated_at();

alter table public.participants enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;

drop policy if exists "No direct participants access" on public.participants;
drop policy if exists "No direct matches access" on public.matches;
drop policy if exists "No direct predictions access" on public.predictions;

create policy "No direct participants access"
on public.participants
for all
using (false)
with check (false);

create policy "No direct matches access"
on public.matches
for all
using (false)
with check (false);

create policy "No direct predictions access"
on public.predictions
for all
using (false)
with check (false);

insert into public.matches (stage, home_team, away_team, kickoff_at, locked_at)
values
  ('Grup', 'Turkiye', 'Brezilya', '2026-06-20 19:00:00+03', '2026-06-20 18:55:00+03'),
  ('Grup', 'Arjantin', 'Fransa', '2026-06-21 22:00:00+03', '2026-06-21 21:55:00+03'),
  ('Grup', 'Almanya', 'Ispanya', '2026-06-22 19:00:00+03', '2026-06-22 18:55:00+03')
on conflict do nothing;
