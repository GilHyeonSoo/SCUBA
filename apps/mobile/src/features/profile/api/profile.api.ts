import type { DiverProfile } from '@/src/features/profile/types';
import type { ProfileRow } from '@/src/features/social/api/db-types';
import {
  mapDiverProfileToProfileUpdate,
  mapProfileRowToDiverProfile,
  mapProfileRowToSocialUser,
} from '@/src/features/social/api/mappers';
import { getSupabaseClient } from '@/src/services/supabase';
import { getSupabaseSession, requireSupabaseSession } from '@/src/features/social/api/session';
import type { SocialUserProfile } from '@/src/features/social/types';

const PROFILE_SELECT = `
  id,
  display_name,
  bio,
  profile_image_url,
  discipline,
  scuba_level,
  freediving_level,
  total_dives,
  region,
  created_at,
  updated_at
`;

export async function fetchProfileById(userId: string): Promise<SocialUserProfile | null> {
  const client = getSupabaseClient();
  const session = await getSupabaseSession();
  if (!client || !session) {
    return null;
  }

  const { data, error } = await client
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapProfileRowToSocialUser(data as ProfileRow) : null;
}

export async function fetchMyProfile(): Promise<DiverProfile | null> {
  const { client, userId } = await requireSupabaseSession();
  const { data, error } = await client
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    const { error: insertError } = await client.from('profiles').insert({ id: userId });
    if (insertError) {
      throw new Error(insertError.message);
    }

    const { data: created, error: reloadError } = await client
      .from('profiles')
      .select(PROFILE_SELECT)
      .eq('id', userId)
      .single();

    if (reloadError) {
      throw new Error(reloadError.message);
    }

    return mapProfileRowToDiverProfile(created as ProfileRow);
  }

  return mapProfileRowToDiverProfile(data as ProfileRow);
}

export async function upsertMyProfile(profile: Partial<DiverProfile>): Promise<DiverProfile> {
  const { client, userId } = await requireSupabaseSession();
  const payload = {
    id: userId,
    ...mapDiverProfileToProfileUpdate(profile),
  };

  const { data, error } = await client
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select(PROFILE_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfileRowToDiverProfile(data as ProfileRow);
}
