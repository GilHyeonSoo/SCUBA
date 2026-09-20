import type { ProfileRow } from '@/src/features/social/api/db-types';
import { mapProfileRowToSocialUser } from '@/src/features/social/api/mappers';
import { requireSupabaseSession } from '@/src/features/social/api/session';
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

export type FollowStats = {
  postCount: number;
  followerCount: number;
  followingCount: number;
};

async function fetchProfilesByIds(profileIds: string[]): Promise<SocialUserProfile[]> {
  if (profileIds.length === 0) {
    return [];
  }

  const { client } = await requireSupabaseSession();
  const { data, error } = await client.from('profiles').select(PROFILE_SELECT).in('id', profileIds);

  if (error) {
    throw new Error(error.message);
  }

  const byId = new Map(
    ((data ?? []) as ProfileRow[]).map((row) => [row.id, mapProfileRowToSocialUser(row)]),
  );

  return profileIds
    .map((profileId) => byId.get(profileId))
    .filter((profile): profile is SocialUserProfile => profile != null);
}

export async function fetchFollowStats(userId: string): Promise<FollowStats> {
  const { client } = await requireSupabaseSession();

  const [postsResult, followersResult, followingResult] = await Promise.all([
    client
      .from('profile_photos')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    client
      .from('follows')
      .select('follower_id', { count: 'exact', head: true })
      .eq('following_id', userId),
    client
      .from('follows')
      .select('following_id', { count: 'exact', head: true })
      .eq('follower_id', userId),
  ]);

  if (postsResult.error) {
    throw new Error(postsResult.error.message);
  }
  if (followersResult.error) {
    throw new Error(followersResult.error.message);
  }
  if (followingResult.error) {
    throw new Error(followingResult.error.message);
  }

  return {
    postCount: postsResult.count ?? 0,
    followerCount: followersResult.count ?? 0,
    followingCount: followingResult.count ?? 0,
  };
}

export async function fetchFollowers(userId: string): Promise<SocialUserProfile[]> {
  const { client } = await requireSupabaseSession();
  const { data, error } = await client
    .from('follows')
    .select('follower_id')
    .eq('following_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const followerIds = (data ?? []).map((row) => row.follower_id as string);
  return fetchProfilesByIds(followerIds);
}

export async function fetchFollowing(userId: string): Promise<SocialUserProfile[]> {
  const { client } = await requireSupabaseSession();
  const { data, error } = await client
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const followingIds = (data ?? []).map((row) => row.following_id as string);
  return fetchProfilesByIds(followingIds);
}

export async function fetchIsFollowing(targetUserId: string): Promise<boolean> {
  const { client, userId } = await requireSupabaseSession();

  if (targetUserId === userId) {
    return false;
  }

  const { data, error } = await client
    .from('follows')
    .select('follower_id')
    .eq('follower_id', userId)
    .eq('following_id', targetUserId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data != null;
}

export async function toggleFollow(targetUserId: string): Promise<boolean> {
  const { client, userId } = await requireSupabaseSession();

  if (targetUserId === userId) {
    throw new Error('자기 자신은 팔로우할 수 없습니다.');
  }

  const isFollowing = await fetchIsFollowing(targetUserId);

  if (isFollowing) {
    const { error } = await client
      .from('follows')
      .delete()
      .eq('follower_id', userId)
      .eq('following_id', targetUserId);

    if (error) {
      throw new Error(error.message);
    }

    return false;
  }

  const { error } = await client.from('follows').insert({
    follower_id: userId,
    following_id: targetUserId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
