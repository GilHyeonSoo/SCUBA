import type { DivingDiscipline, FreedivingLevel, ScubaLevel } from '@/src/features/profile/types';

export type ProfileRow = {
  id: string;
  display_name: string;
  bio: string;
  profile_image_url: string | null;
  discipline: DivingDiscipline;
  scuba_level: ScubaLevel | null;
  freediving_level: FreedivingLevel | null;
  total_dives: number;
  region: string;
  created_at: string;
  updated_at: string;
};

export type ProfilePhotoRow = {
  id: string;
  user_id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type FollowRow = {
  follower_id: string;
  following_id: string;
  created_at: string;
};

export type PhotoLikeRow = {
  user_id: string;
  photo_id: string;
  created_at: string;
};

export type PhotoCommentRow = {
  id: string;
  photo_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles?: Pick<ProfileRow, 'display_name'> | Pick<ProfileRow, 'display_name'>[] | null;
};
