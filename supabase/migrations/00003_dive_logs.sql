-- Dive log schema for imported and manual dive records (PoC foundation)

create table if not exists public.dive_computers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vendor text not null,
  model text not null,
  fingerprint_model text,
  fingerprint_serial text,
  nickname text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, vendor, model, fingerprint_model, fingerprint_serial)
);

create table if not exists public.dive_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dive_computer_id uuid references public.dive_computers (id) on delete set null,
  source_format text not null,
  source_dive_id text not null,
  dive_number integer,
  started_at timestamp not null,
  ended_at timestamp,
  duration_sec integer not null check (duration_sec >= 0),
  max_depth_m double precision,
  avg_depth_m double precision,
  water_temp_c double precision,
  surface_pressure_bar double precision,
  gas_o2_percent double precision,
  gas_description text,
  cns_percent double precision,
  otu integer,
  profile jsonb not null default '[]'::jsonb,
  profile_sample_count integer not null default 0,
  profile_duration_sec integer,
  missing_fields text[] not null default '{}',
  imported_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, source_format, source_dive_id)
);

create index if not exists dive_computers_user_id_idx on public.dive_computers (user_id);
create index if not exists dive_logs_user_id_started_at_idx on public.dive_logs (user_id, started_at desc);
create index if not exists dive_logs_dive_computer_id_idx on public.dive_logs (dive_computer_id);

create or replace function public.set_dive_records_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists dive_computers_set_updated_at on public.dive_computers;
create trigger dive_computers_set_updated_at
before update on public.dive_computers
for each row
execute function public.set_dive_records_updated_at();

drop trigger if exists dive_logs_set_updated_at on public.dive_logs;
create trigger dive_logs_set_updated_at
before update on public.dive_logs
for each row
execute function public.set_dive_records_updated_at();

alter table public.dive_computers enable row level security;
alter table public.dive_logs enable row level security;

create policy "dive_computers_select_own"
on public.dive_computers
for select
to authenticated
using (user_id = auth.uid());

create policy "dive_computers_insert_own"
on public.dive_computers
for insert
to authenticated
with check (user_id = auth.uid());

create policy "dive_computers_update_own"
on public.dive_computers
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "dive_computers_delete_own"
on public.dive_computers
for delete
to authenticated
using (user_id = auth.uid());

create policy "dive_logs_select_own"
on public.dive_logs
for select
to authenticated
using (user_id = auth.uid());

create policy "dive_logs_insert_own"
on public.dive_logs
for insert
to authenticated
with check (user_id = auth.uid());

create policy "dive_logs_update_own"
on public.dive_logs
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "dive_logs_delete_own"
on public.dive_logs
for delete
to authenticated
using (user_id = auth.uid());
