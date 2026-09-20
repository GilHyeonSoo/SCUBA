import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchFollowers,
  fetchFollowStats,
  fetchFollowing,
  fetchIsFollowing,
  toggleFollow,
} from '@/src/features/social/api/follow.api';
import { socialQueryKeys } from '@/src/features/social/query-keys';
import { useSupabaseAuth } from '@/src/hooks/useSupabaseAuth';

export function useFollowStatsRemote(userId: string | null) {
  const { isRemoteSocialEnabled } = useSupabaseAuth();

  return useQuery({
    queryKey: socialQueryKeys.followStats(userId ?? 'unknown'),
    enabled: isRemoteSocialEnabled && userId != null && !userId.startsWith('buddy-') && userId !== 'me',
    queryFn: () => fetchFollowStats(userId as string),
  });
}

export function useMyFollowStatsRemote() {
  const { isRemoteSocialEnabled } = useSupabaseAuth();

  return useQuery({
    queryKey: socialQueryKeys.followStats('me'),
    enabled: isRemoteSocialEnabled,
    queryFn: async () => {
      const { requireSupabaseSession } = await import('@/src/features/social/api/session');
      const { userId } = await requireSupabaseSession();
      return fetchFollowStats(userId);
    },
  });
}

export function useFollowersRemote(userId: string | null) {
  const { isRemoteSocialEnabled } = useSupabaseAuth();

  return useQuery({
    queryKey: socialQueryKeys.followers(userId ?? 'unknown'),
    enabled: isRemoteSocialEnabled && userId != null && !userId.startsWith('buddy-') && userId !== 'me',
    queryFn: () => fetchFollowers(userId as string),
  });
}

export function useFollowingRemote(userId: string | null) {
  const { isRemoteSocialEnabled } = useSupabaseAuth();

  return useQuery({
    queryKey: socialQueryKeys.following(userId ?? 'unknown'),
    enabled: isRemoteSocialEnabled && userId != null && !userId.startsWith('buddy-') && userId !== 'me',
    queryFn: () => fetchFollowing(userId as string),
  });
}

export function useIsFollowingRemote(targetUserId: string | null) {
  const { isRemoteSocialEnabled } = useSupabaseAuth();

  return useQuery({
    queryKey: socialQueryKeys.isFollowing(targetUserId ?? 'unknown'),
    enabled:
      isRemoteSocialEnabled &&
      targetUserId != null &&
      !targetUserId.startsWith('buddy-') &&
      targetUserId !== 'me',
    queryFn: () => fetchIsFollowing(targetUserId as string),
  });
}

export function useToggleFollowRemote(targetUserId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => toggleFollow(targetUserId as string),
    onSuccess: () => {
      if (!targetUserId) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: socialQueryKeys.isFollowing(targetUserId) });
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.followStats(targetUserId) });
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.followStats('me') });
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.followers(targetUserId) });
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.following('me') });
    },
  });
}
