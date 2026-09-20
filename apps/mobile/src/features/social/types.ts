import type { DivingDiscipline } from '@/src/features/profile/types';

export type SocialUserProfile = {
  id: string;
  displayName: string;
  bio: string;
  profileImageUrl: string | null;
  discipline: DivingDiscipline;
  certificationLabel: string;
  region: string;
};

export type PhotoComment = {
  id: string;
  photoId: string;
  userId: string;
  userDisplayName: string;
  body: string;
  createdAt: number;
};
