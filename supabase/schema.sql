-- Supabase schema for TrialFind Saved Trials / Bookmarks
create table if not exists public.saved_trials (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  nct_id text not null,
  trial_data jsonb not null,
  created_at timestamptz not null default now(),
  unique (client_id, nct_id)
);

create index if not exists idx_saved_trials_client_id
  on public.saved_trials (client_id, created_at desc);

alter table public.saved_trials enable row level security;

create policy "Allow public read/write by client_id"
  on public.saved_trials
  for all
  using (true)
  with check (true);
