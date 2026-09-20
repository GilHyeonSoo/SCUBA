import {
  freedivingLevelConfig,
  scubaLevelConfig,
} from '@/src/features/profile/constants';
import type { DiverProfile, ProfileGalleryImage } from '@/src/features/profile/types';
import type {
  PhotoCommentRow,
  ProfilePhotoRow,
  ProfileRow,
} from '@/src/features/social/api/db-types';
import type { PhotoComment, SocialUserProfile } from '@/src/features/social/types';
import { getSupabaseProjectUrl } from '@/src/services/supabase';

const PROFILE_PHOTOS_BUCKET = 'profile-photos';

export function resolvePublicStorageUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) {
    return null;
  }

  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }

  const projectUrl = getSupabaseProjectUrl();
  if (!projectUrl) {
    return storagePath;
  }

  return `${projectUrl}/storage/v1/object/public/${PROFILE_PHOTOS_BUCKET}/${storagePath}`;
}

function resolveCertificationLabel(row: ProfileRow): string {
  if (row.discipline === 'freediving') {
    return row.freediving_level ? freedivingLevelConfig[row.freediving_level].shortLabel : '-';
  }

  if (row.discipline === 'both') {
    const scuba = row.scuba_level ? scubaLevelConfig[row.scuba_level].shortLabel : '-';
    const free = row.freediving_level ? freedivingLevelConfig[row.freediving_level].shortLabel : '-';
    return `${scuba} · ${free}`;
  }

  return row.scuba_level ? scubaLevelConfig[row.scuba_level].shortLabel : '-';
}

export function mapProfileRowToDiverProfile(row: ProfileRow): DiverProfile {
  return {
    displayName: row.display_name,
    bio: row.bio,
    profileImageUrl: resolvePublicStorageUrl(row.profile_image_url),
    discipline: row.discipline,
    scubaLevel: row.scuba_level,
    freedivingLevel: row.freediving_level,
    totalDives: row.total_dives,
  };
}

export function mapProfileRowToSocialUser(row: ProfileRow): SocialUserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    bio: row.bio,
    profileImageUrl: resolvePublicStorageUrl(row.profile_image_url),
    discipline: row.discipline,
    certificationLabel: resolveCertificationLabel(row),
    region: row.region || '지역 미기록',
  };
}

export function mapDiverProfileToProfileUpdate(
  profile: Partial<DiverProfile> & { region?: string },
): Partial<ProfileRow> {
  return {
    display_name: profile.displayName,
    bio: profile.bio,
    profile_image_url: profile.profileImageUrl ?? undefined,
    discipline: profile.discipline,
    scuba_level: profile.scubaLevel,
    freediving_level: profile.freedivingLevel,
    total_dives: profile.totalDives,
    region: profile.region,
  };
}

export function mapPhotoRowToGalleryImage(row: ProfilePhotoRow): ProfileGalleryImage {
  return {
    id: row.id,
    uri: resolvePublicStorageUrl(row.storage_path) ?? row.storage_path,
    createdAt: new Date(row.created_at).getTime(),
    userId: row.user_id,
    caption: row.caption ?? undefined,
  };
}

function resolveCommentAuthorName(
  profiles: PhotoCommentRow['profiles'],
): string {
  if (Array.isArray(profiles)) {
    return profiles[0]?.display_name ?? '다이버';
  }

  return profiles?.display_name ?? '다이버';
}

export function mapCommentRowToPhotoComment(row: PhotoCommentRow): PhotoComment {
  return {
    id: row.id,
    photoId: row.photo_id,
    userId: row.user_id,
    userDisplayName: resolveCommentAuthorName(row.profiles),
    body: row.body,
    createdAt: new Date(row.created_at).getTime(),
  };
}
