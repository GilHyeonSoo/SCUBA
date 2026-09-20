import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteGalleryPhoto,
  fetchUserGallery,
  uploadGalleryPhoto,
} from '@/src/features/profile/api/gallery.api';
import { useProfileGalleryStore } from '@/src/features/profile/stores/profile-gallery-store';
import { socialQueryKeys } from '@/src/features/social/query-keys';
import { useSupabaseAuth } from '@/src/hooks/useSupabaseAuth';
import { getCurrentUserId } from '@/src/hooks/useSupabaseAuth';

export function useGalleryRemote(userId: string | null) {
  const { isRemoteSocialEnabled } = useSupabaseAuth();

  return useQuery({
    queryKey: socialQueryKeys.gallery(userId ?? 'unknown'),
    enabled:
      isRemoteSocialEnabled &&
      userId != null &&
      !userId.startsWith('buddy-') &&
      userId !== 'me',
    queryFn: () => fetchUserGallery(userId as string),
  });
}

export function useMyGalleryRemote() {
  const { isRemoteSocialEnabled } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: socialQueryKeys.gallery('me'),
    enabled: isRemoteSocialEnabled,
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) {
        return [];
      }

      return fetchUserGallery(userId);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadGalleryPhoto,
    onSuccess: (photo) => {
      queryClient.setQueryData(socialQueryKeys.gallery('me'), (current: typeof query.data) => [
        photo,
        ...(current ?? []),
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGalleryPhoto,
    onSuccess: (_, photoId) => {
      queryClient.setQueryData(socialQueryKeys.gallery('me'), (current: typeof query.data) =>
        (current ?? []).filter((photo) => photo.id !== photoId),
      );
      useProfileGalleryStore.getState().removeImage(photoId);
    },
  });

  useEffect(() => {
    if (query.data && isRemoteSocialEnabled) {
      useProfileGalleryStore.getState().setImages(query.data);
    }
  }, [query.data, isRemoteSocialEnabled]);

  return {
    ...query,
    isRemote: isRemoteSocialEnabled,
    uploadPhoto: uploadMutation.mutateAsync,
    deletePhoto: deleteMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
