-- Places POI schema for dive shops, pools, and sites
create extension if not exists postgis;

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  place_type text not null check (place_type in ('shop', 'pool', 'site')),
  name text not null,
  name_normalized text not null,
  country_code text not null default 'KR',
  region text,
  city text,
  address_line text,
  latitude double precision not null,
  longitude double precision not null,
  geom geography(point, 4326) generated always as (
    st_setsrid(st_makepoint(longitude, latitude), 4326)::geography
  ) stored,
  phone text,
  website text,
  google_maps_url text,
  naver_map_url text,
  kakao_map_url text,
  status text not null default 'active' check (status in ('active', 'closed', 'unknown')),
  verification_status text not null default 'unverified'
    check (verification_status in ('verified', 'partial', 'unverified', 'disputed')),
  verification_source_count integer not null default 0,
  confidence text check (confidence in ('high', 'medium', 'low')),
  short_description text,
  tags text[] not null default '{}',
  raw_category text,
  source_apis text[] not null default '{}',
  merged_from_count integer not null default 1,
  is_published boolean not null default true,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.place_sources (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  source_api text not null,
  source_id text not null,
  source_url text,
  source_query text,
  raw_payload jsonb not null default '{}'::jsonb,
  fetched_at timestamptz,
  created_at timestamptz not null default now(),
  unique (source_api, source_id)
);

create index if not exists places_place_type_idx on public.places (place_type);
create index if not exists places_verification_status_idx on public.places (verification_status);
create index if not exists places_geom_idx on public.places using gist (geom);
create index if not exists places_name_normalized_idx on public.places (name_normalized);
create index if not exists place_sources_place_id_idx on public.place_sources (place_id);

create or replace function public.set_places_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists places_set_updated_at on public.places;
create trigger places_set_updated_at
before update on public.places
for each row
execute function public.set_places_updated_at();

alter table public.places enable row level security;
alter table public.place_sources enable row level security;

create policy "places_public_read_published"
on public.places
for select
to anon, authenticated
using (is_published = true);

create policy "place_sources_public_read_published"
on public.place_sources
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.places p
    where p.id = place_sources.place_id
      and p.is_published = true
  )
);
