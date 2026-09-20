import { create } from 'zustand';

import { buddyProfiles } from '@/src/features/buddy/mock-data';
import { CURRENT_USER_ID } from '@/src/features/social/constants';
import type { SocialUserProfile } from '@/src/features/social/types';
import { mockUserProfiles } from '@/src/features/social/mock-users';

type FollowStoreState = {
  followingIds: Set<string>;
  follow: (userId: string) => void;
  unfollow: (userId: string) => void;
  toggleFollow: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  getFollowerCount: (userId: string) => number;
  getFollowingCount: (userId: string) => number;
  getFollowers: (userId: string) => SocialUserProfile[];
  getFollowing: (userId: string) => SocialUserProfile[];
};

const initialFollowing = new Set<string>(['buddy-1', 'buddy-3']);

function toProfile(userId: string): SocialUserProfile | null {
  return mockUserProfiles[userId] ?? null;
}

function mockFollowersFor(userId: string): string[] {
  if (userId === CURRENT_USER_ID) {
    return ['buddy-2', 'buddy-4'];
  }

  if (userId === 'buddy-1') {
    return ['buddy-2'];
  }

  return buddyProfiles
    .filter((buddy) => buddy.id !== userId)
    .slice(0, 2)
    .map((buddy) => buddy.id);
}

export const useFollowStore = create<FollowStoreState>((set, get) => ({
  followingIds: initialFollowing,

  follow: (userId) => {
    if (userId === CURRENT_USER_ID) {
      return;
    }

    set((state) => {
      const next = new Set(state.followingIds);
      next.add(userId);
      return { followingIds: next };
    });
  },

  unfollow: (userId) => {
    set((state) => {
      const next = new Set(state.followingIds);
      next.delete(userId);
      return { followingIds: next };
    });
  },

  toggleFollow: (userId) => {
    if (get().isFollowing(userId)) {
      get().unfollow(userId);
      return;
    }

    get().follow(userId);
  },

  isFollowing: (userId) => get().followingIds.has(userId),

  getFollowerCount: (userId) => get().getFollowers(userId).length,

  getFollowingCount: (userId) => {
    if (userId === CURRENT_USER_ID) {
      return get().followingIds.size;
    }

    return userId === 'buddy-1' ? 2 : 1;
  },

  getFollowers: (userId) => {
    const ids = [...mockFollowersFor(userId)];
    if (
      userId !== CURRENT_USER_ID &&
      get().isFollowing(userId) &&
      !ids.includes(CURRENT_USER_ID)
    ) {
      ids.unshift(CURRENT_USER_ID);
    }

    return ids.map(toProfile).filter((profile): profile is SocialUserProfile => profile != null);
  },

  getFollowing: (userId) => {
    if (userId === CURRENT_USER_ID) {
      return [...get().followingIds]
        .map(toProfile)
        .filter((profile): profile is SocialUserProfile => profile != null);
    }

    if (userId === 'buddy-1') {
      return [mockUserProfiles['buddy-2'], mockUserProfiles['buddy-4']].filter(
        (profile): profile is SocialUserProfile => profile != null,
      );
    }

    const primary = mockUserProfiles['buddy-1'];
    return primary ? [primary] : [];
  },
}));
