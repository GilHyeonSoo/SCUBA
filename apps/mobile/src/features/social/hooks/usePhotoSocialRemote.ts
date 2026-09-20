import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addPhotoComment,
  fetchPhotoComments,
  fetchPhotoSocialSummaries,
  togglePhotoLike,
} from '@/src/features/social/api/photo-social.api';
import { socialQueryKeys } from '@/src/features/social/query-keys';
import { useSupabaseAuth } from '@/src/hooks/useSupabaseAuth';

export function usePhotoSocialSummariesRemote(photoIds: string[]) {
  const { isRemoteSocialEnabled } = useSupabaseAuth();

  return useQuery({
    queryKey: [...socialQueryKeys.photoSocial(photoIds.join(',')), photoIds],
    enabled: isRemoteSocialEnabled && photoIds.length > 0,
    queryFn: () => fetchPhotoSocialSummaries(photoIds),
  });
}

export function usePhotoCommentsRemote(photoId: string | null) {
  const { isRemoteSocialEnabled } = useSupabaseAuth();

  return useQuery({
    queryKey: socialQueryKeys.photoComments(photoId ?? 'unknown'),
    enabled: isRemoteSocialEnabled && photoId != null,
    queryFn: () => fetchPhotoComments(photoId as string),
  });
}

export function useTogglePhotoLikeRemote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePhotoLike,
    onSuccess: (_liked, photoId) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.photoSocial(photoId) });
    },
  });
}

export function useAddPhotoCommentRemote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ photoId, body }: { photoId: string; body: string }) =>
      addPhotoComment(photoId, body),
    onSuccess: (_comment, variables) => {
      queryClient.invalidateQueries({
        queryKey: socialQueryKeys.photoComments(variables.photoId),
      });
      queryClient.invalidateQueries({
        queryKey: socialQueryKeys.photoSocial(variables.photoId),
      });
    },
  });
}
