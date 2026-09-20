import * as Crypto from 'expo-crypto';

import type { ProfileGalleryImage } from '@/src/features/profile/types';
import type { ProfilePhotoRow } from '@/src/features/social/api/db-types';
import { mapPhotoRowToGalleryImage } from '@/src/features/social/api/mappers';
import { requireSupabaseSession } from '@/src/features/social/api/session';

const PROFILE_PHOTOS_BUCKET = 'profile-photos';

const PHOTO_SELECT = `
  id,
  user_id,
  storage_path,
  caption,
  sort_order,
  created_at
`;

function inferContentType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) {
    return 'image/png';
  }
  if (lower.endsWith('.webp')) {
    return 'image/webp';
  }

  return 'image/jpeg';
}

export async function fetchUserGallery(userId: string): Promise<ProfileGalleryImage[]> {
  const { client } = await requireSupabaseSession();
  const { data, error } = await client
    .from('profile_photos')
    .select(PHOTO_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as ProfilePhotoRow[]).map(mapPhotoRowToGalleryImage);
}

export async function uploadGalleryPhoto(localUri: string): Promise<ProfileGalleryImage> {
  const { client, userId } = await requireSupabaseSession();
  const photoId = Crypto.randomUUID();
  const extension = inferContentType(localUri).split('/')[1] ?? 'jpg';
  const storagePath = `${userId}/${photoId}.${extension}`;

  const response = await fetch(localUri);
  const blob = await response.blob();

  const { error: uploadError } = await client.storage
    .from(PROFILE_PHOTOS_BUCKET)
    .upload(storagePath, blob, {
      contentType: inferContentType(localUri),
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data, error } = await client
    .from('profile_photos')
    .insert({
      id: photoId,
      user_id: userId,
      storage_path: storagePath,
    })
    .select(PHOTO_SELECT)
    .single();

  if (error) {
    await client.storage.from(PROFILE_PHOTOS_BUCKET).remove([storagePath]);
    throw new Error(error.message);
  }

  return mapPhotoRowToGalleryImage(data as ProfilePhotoRow);
}

export async function deleteGalleryPhoto(photoId: string): Promise<void> {
  const { client, userId } = await requireSupabaseSession();

  const { data: photo, error: fetchError } = await client
    .from('profile_photos')
    .select('id, storage_path, user_id')
    .eq('id', photoId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!photo || photo.user_id !== userId) {
    throw new Error('삭제할 수 있는 사진이 아닙니다.');
  }

  const { error: deleteRowError } = await client.from('profile_photos').delete().eq('id', photoId);
  if (deleteRowError) {
    throw new Error(deleteRowError.message);
  }

  await client.storage.from(PROFILE_PHOTOS_BUCKET).remove([photo.storage_path]);
}
