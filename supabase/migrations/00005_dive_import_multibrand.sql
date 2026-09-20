-- Multi-brand import hardening: nullable duration and dedup fingerprint support

alter table public.dive_logs
  alter column duration_sec drop not null;

alter table public.dive_logs
  add column if not exists source_timezone_offset_min smallint null;

alter table public.dive_logs
  add column if not exists dedup_fingerprint text null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'dive_logs_source_timezone_offset_min_check'
  ) then
    alter table public.dive_logs
      add constraint dive_logs_source_timezone_offset_min_check
      check (
        source_timezone_offset_min is null
        or source_timezone_offset_min between -840 and 840
      );
  end if;
end $$;

create index if not exists dive_logs_dedup_fingerprint_idx
  on public.dive_logs (user_id, dedup_fingerprint)
  where dedup_fingerprint is not null;
