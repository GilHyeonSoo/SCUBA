import { create } from 'zustand';

import type { DiverProfile } from '@/src/features/profile/types';

const defaultProfile: DiverProfile = {
  displayName: '다이버',
  bio: '프로필을 완성하고 버디를 찾아보세요',
  profileImageUrl: null,
  discipline: 'scuba',
  scubaLevel: 'aow',
  freedivingLevel: null,
  totalDives: 0,
};

function normalizeProfile(profile?: Partial<DiverProfile>): DiverProfile {
  return {
    ...defaultProfile,
    ...profile,
    displayName: profile?.displayName?.trim() || defaultProfile.displayName,
    bio: profile?.bio?.trim() || defaultProfile.bio,
    profileImageUrl: profile?.profileImageUrl ?? null,
    discipline: profile?.discipline ?? defaultProfile.discipline,
    scubaLevel: profile?.scubaLevel ?? defaultProfile.scubaLevel,
    freedivingLevel: profile?.freedivingLevel ?? defaultProfile.freedivingLevel,
    totalDives: profile?.totalDives ?? defaultProfile.totalDives,
  };
}

type ProfileStoreState = {
  profile: DiverProfile;
  updateProfile: (updates: Partial<DiverProfile>) => void;
  resetProfile: () => void;
};

export const useProfileStore = create<ProfileStoreState>((set, get) => ({
  profile: normalizeProfile(),

  updateProfile: (updates) => {
    set({
      profile: normalizeProfile({
        ...get().profile,
        ...updates,
      }),
    });
  },

  resetProfile: () => {
    set({ profile: normalizeProfile() });
  },
}));
