-- Cycle Tracker — Supabase schema
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table if not exists cycles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  start_date date not null,
  end_date date,
  notes text,
  symptoms jsonb,
  created_at timestamptz default now()
);

-- One period range per start date, per user (the app upserts on this).
create unique index if not exists cycles_user_start_unique
  on cycles (user_id, start_date);

-- Fast lookups of a user's cycles.
create index if not exists cycles_user_id_idx on cycles (user_id);

-- Row Level Security: each user can only see and modify their own rows.
alter table cycles enable row level security;

drop policy if exists "Users can only access own data" on cycles;
create policy "Users can only access own data" on cycles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
