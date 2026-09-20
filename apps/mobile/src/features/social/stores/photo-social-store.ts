import { create } from 'zustand';

import { CURRENT_USER_ID } from '@/src/features/social/constants';
import type { PhotoComment } from '@/src/features/social/types';

type PhotoSocialStoreState = {
  likedPhotoIds: Set<string>;
  commentsByPhotoId: Record<string, PhotoComment[]>;
  toggleLike: (photoId: string) => void;
  isLiked: (photoId: string) => boolean;
  getLikeCount: (photoId: string) => number;
  getComments: (photoId: string) => PhotoComment[];
  addComment: (photoId: string, body: string, userDisplayName?: string) => void;
};

const seedLikeCounts: Record<string, number> = {
  default: 3,
};

function createCommentId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function baseLikeCount(photoId: string): number {
  let hash = 0;
  for (let index = 0; index < photoId.length; index += 1) {
    hash = (hash + photoId.charCodeAt(index) * (index + 1)) % 17;
  }

  return seedLikeCounts.default + (hash % 8);
}

const seedComments: Record<string, PhotoComment[]> = {
  seed: [
    {
      id: 'seed-comment-1',
      photoId: 'seed',
      userId: 'buddy-1',
      userDisplayName: 'Diver Kim',
      body: '수심 프로파일 멋지네요!',
      createdAt: Date.now() - 86_400_000,
    },
  ],
};

export const usePhotoSocialStore = create<PhotoSocialStoreState>((set, get) => ({
  likedPhotoIds: new Set<string>(),
  commentsByPhotoId: seedComments,

  toggleLike: (photoId) => {
    set((state) => {
      const next = new Set(state.likedPhotoIds);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }

      return { likedPhotoIds: next };
    });
  },

  isLiked: (photoId) => get().likedPhotoIds.has(photoId),

  getLikeCount: (photoId) => {
    const base = baseLikeCount(photoId);
    return get().isLiked(photoId) ? base + 1 : base;
  },

  getComments: (photoId) => get().commentsByPhotoId[photoId] ?? [],

  addComment: (photoId, body, userDisplayName = '다이버') => {
    const trimmed = body.trim();
    if (!trimmed) {
      return;
    }

    const comment: PhotoComment = {
      id: createCommentId(),
      photoId,
      userId: CURRENT_USER_ID,
      userDisplayName,
      body: trimmed,
      createdAt: Date.now(),
    };

    set((state) => ({
      commentsByPhotoId: {
        ...state.commentsByPhotoId,
        [photoId]: [...(state.commentsByPhotoId[photoId] ?? []), comment],
      },
    }));
  },
}));
