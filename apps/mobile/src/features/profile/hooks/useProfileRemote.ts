import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchMyProfile, fetchProfileById, upsertMyProfile } from '@/src/features/profile/api/profile.api';
import { useProfileStore } from '@/src/features/profile/stores/profile-store';
import type { DiverProfile } from '@/src/features/profile/types';
import { socialQueryKeys } from '@/src/features/social/query-keys';
import { useSupabaseAuth } from '@/src/hooks/useSupabaseAuth';

export function useMyProfileRemote() {
  const { isRemoteSocialEnabled, isHydrated } = useSupabaseAuth();
  const updateLocalProfile = useProfileStore((state) => state.updateProfile);

  const query = useQuery({
    queryKey: socialQueryKeys.myProfile,
    enabled: isRemoteSocialEnabled,
    queryFn: fetchMyProfile,
  });

  useEffect(() => {
    if (query.data) {
      updateLocalProfile(query.data);
    }
  }, [query.data, updateLocalProfile]);

  return {
    ...query,
    isRemote: isRemoteSocialEnabled,
    isReady: isHydrated,
  };
}

export function useProfileRemote(userId: string | null) {
  const { isRemoteSocialEnabled } = useSupabaseAuth();

  return useQuery({
    queryKey: socialQueryKeys.profile(userId ?? 'unknown'),
    enabled: isRemoteSocialEnabled && userId != null && !userId.startsWith('buddy-'),
    queryFn: () => fetchProfileById(userId as string),
  });
}

export function useUpsertMyProfileRemote() {
  const queryClient = useQueryClient();
  const updateLocalProfile = useProfileStore((state) => state.updateProfile);

  return useMutation({
    mutationFn: (profile: Partial<DiverProfile>) => upsertMyProfile(profile),
    onSuccess: (savedProfile) => {
      updateLocalProfile(savedProfile);
      queryClient.setQueryData(socialQueryKeys.myProfile, savedProfile);
    },
  });
}
