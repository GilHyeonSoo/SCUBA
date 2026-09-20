-- Enrichment data collected for places (images + type-specific metadata)

create table if not exists public.place_enrichments (
  place_id uuid primary key references public.places(id) on delete cascade,
  enrichment_status text not null
    check (enrichment_status in ('complete', 'partial', 'not_found', 'error')),
  enriched_at timestamptz not null,
  naver_place_page_url text,
  known_data_applied jsonb,
  pool_data jsonb,
  site_data jsonb,
  shop_data jsonb,
  sources_checked text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.place_images (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  url text not null,
  source text not null check (source in ('official_website', 'google_places', 'naver_place')),
  source_page_url text not null,
  caption text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (place_id, url)
);

create index if not exists place_enrichments_status_idx on public.place_enrichments (enrichment_status);
create index if not exists place_images_place_id_idx on public.place_images (place_id);
create index if not exists place_images_primary_idx on public.place_images (place_id, is_primary);

create or replace function public.set_place_enrichments_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists place_enrichments_set_updated_at on public.place_enrichments;
create trigger place_enrichments_set_updated_at
before update on public.place_enrichments
for each row
execute function public.set_place_enrichments_updated_at();

alter table public.place_enrichments enable row level security;
alter table public.place_images enable row level security;

create policy "place_enrichments_public_read_published"
on public.place_enrichments
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.places p
    where p.id = place_enrichments.place_id
      and p.is_published = true
  )
);

create policy "place_images_public_read_published"
on public.place_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.places p
    where p.id = place_images.place_id
      and p.is_published = true
  )
);
