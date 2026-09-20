-- Profiles, gallery photos, and social graph (follow / likes / comments)

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '다이버',
  bio text not null default '',
  profile_image_url text,
  discipline text not null default 'scuba'
    check (discipline in ('scuba', 'freediving', 'both')),
  scuba_level text
    check (scuba_level is null or scuba_level in ('try', 'ow', 'aow', 'rescue', 'divemaster', 'instructor')),
  freediving_level text
    check (freediving_level is null or freediving_level in ('intro', 'l1', 'l2', 'l3', 'l4', 'instructor')),
  total_dives integer not null default 0 check (total_dives >= 0),
  region text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, storage_path)
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.photo_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  photo_id uuid not null references public.profile_photos (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, photo_id)
);

create table if not exists public.photo_comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.profile_photos (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists profile_photos_user_id_created_at_idx
  on public.profile_photos (user_id, created_at desc);

create index if not exists follows_following_id_idx on public.follows (following_id);
create index if not exists follows_follower_id_idx on public.follows (follower_id);
create index if not exists photo_likes_photo_id_idx on public.photo_likes (photo_id);
create index if not exists photo_comments_photo_id_created_at_idx
  on public.photo_comments (photo_id, created_at asc);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1), '다이버')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row
execute function public.handle_new_user_profile();

alter table public.profiles enable row level security;
alter table public.profile_photos enable row level security;
alter table public.follows enable row level security;
alter table public.photo_likes enable row level security;
alter table public.photo_comments enable row level security;

create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "profile_photos_select_authenticated"
on public.profile_photos
for select
to authenticated
using (true);

create policy "profile_photos_insert_own"
on public.profile_photos
for insert
to authenticated
with check (user_id = auth.uid());

create policy "profile_photos_update_own"
on public.profile_photos
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "profile_photos_delete_own"
on public.profile_photos
for delete
to authenticated
using (user_id = auth.uid());

create policy "follows_select_authenticated"
on public.follows
for select
to authenticated
using (true);

create policy "follows_insert_own"
on public.follows
for insert
to authenticated
with check (follower_id = auth.uid());

create policy "follows_delete_own"
on public.follows
for delete
to authenticated
using (follower_id = auth.uid());

create policy "photo_likes_select_authenticated"
on public.photo_likes
for select
to authenticated
using (true);

create policy "photo_likes_insert_own"
on public.photo_likes
for insert
to authenticated
with check (user_id = auth.uid());

create policy "photo_likes_delete_own"
on public.photo_likes
for delete
to authenticated
using (user_id = auth.uid());

create policy "photo_comments_select_authenticated"
on public.photo_comments
for select
to authenticated
using (true);

create policy "photo_comments_insert_own"
on public.photo_comments
for insert
to authenticated
with check (user_id = auth.uid());

create policy "photo_comments_delete_own"
on public.photo_comments
for delete
to authenticated
using (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "profile_photos_storage_select"
on storage.objects
for select
to authenticated
using (bucket_id = 'profile-photos');

create policy "profile_photos_storage_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "profile_photos_storage_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "profile_photos_storage_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
