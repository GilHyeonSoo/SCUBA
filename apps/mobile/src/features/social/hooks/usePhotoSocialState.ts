import { useCallback } from 'react';

import {
  useAddPhotoCommentRemote,
  usePhotoCommentsRemote,
  usePhotoSocialSummariesRemote,
  useTogglePhotoLikeRemote,
} from '@/src/features/social/hooks/usePhotoSocialRemote';
import { usePhotoSocialStore } from '@/src/features/social/stores/photo-social-store';
import type { PhotoComment } from '@/src/features/social/types';
import { useSupabaseAuth } from '@/src/hooks/useSupabaseAuth';

export function usePhotoSocialState(photoIds: string[]) {
  const { isRemoteSocialEnabled } = useSupabaseAuth();

  const localLikedPhotoIds = usePhotoSocialStore((state) => state.likedPhotoIds);
  const localCommentsByPhotoId = usePhotoSocialStore((state) => state.commentsByPhotoId);
  const localToggleLike = usePhotoSocialStore((state) => state.toggleLike);
  const localGetLikeCount = usePhotoSocialStore((state) => state.getLikeCount);
  const localGetComments = usePhotoSocialStore((state) => state.getComments);
  const localAddComment = usePhotoSocialStore((state) => state.addComment);

  const summariesQuery = usePhotoSocialSummariesRemote(photoIds);
  const toggleLikeRemote = useTogglePhotoLikeRemote();

  const isLiked = useCallback(
    (photoId: string) => {
      if (isRemoteSocialEnabled) {
        return summariesQuery.data?.[photoId]?.likedByMe ?? false;
      }

      return localLikedPhotoIds.has(photoId);
    },
    [isRemoteSocialEnabled, localLikedPhotoIds, summariesQuery.data],
  );

  const getLikeCount = useCallback(
    (photoId: string) => {
      if (isRemoteSocialEnabled) {
        return summariesQuery.data?.[photoId]?.likeCount ?? 0;
      }

      return localGetLikeCount(photoId);
    },
    [isRemoteSocialEnabled, localGetLikeCount, summariesQuery.data],
  );

  const getCommentCount = useCallback(
    (photoId: string) => {
      if (isRemoteSocialEnabled) {
        return summariesQuery.data?.[photoId]?.commentCount ?? 0;
      }

      return (localCommentsByPhotoId[photoId] ?? []).length;
    },
    [isRemoteSocialEnabled, localCommentsByPhotoId, summariesQuery.data],
  );

  const toggleLike = useCallback(
    (photoId: string) => {
      if (isRemoteSocialEnabled) {
        toggleLikeRemote.mutate(photoId);
        return;
      }

      localToggleLike(photoId);
    },
    [isRemoteSocialEnabled, localToggleLike, toggleLikeRemote],
  );

  return {
    isRemote: isRemoteSocialEnabled,
    isLiked,
    getLikeCount,
    getCommentCount,
    toggleLike,
    localGetComments,
    localAddComment,
    summariesQuery,
  };
}

export function usePhotoCommentsState(photoId: string | null, authorDisplayName: string) {
  const { isRemoteSocialEnabled } = useSupabaseAuth();
  const localGetComments = usePhotoSocialStore((state) => state.getComments);
  const localAddComment = usePhotoSocialStore((state) => state.addComment);
  const commentsQuery = usePhotoCommentsRemote(photoId);
  const addCommentRemote = useAddPhotoCommentRemote();

  const comments: PhotoComment[] = isRemoteSocialEnabled
    ? (commentsQuery.data ?? [])
    : photoId
      ? localGetComments(photoId)
      : [];

  const addComment = useCallback(
    (body: string) => {
      if (!photoId || body.trim().length === 0) {
        return;
      }

      if (isRemoteSocialEnabled) {
        addCommentRemote.mutate({ photoId, body });
        return;
      }

      localAddComment(photoId, body, authorDisplayName);
    },
    [addCommentRemote, authorDisplayName, isRemoteSocialEnabled, localAddComment, photoId],
  );

  return {
    comments,
    addComment,
    isSubmitting: addCommentRemote.isPending,
  };
}
