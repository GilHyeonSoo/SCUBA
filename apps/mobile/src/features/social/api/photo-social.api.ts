import type { PhotoCommentRow } from '@/src/features/social/api/db-types';
import { mapCommentRowToPhotoComment } from '@/src/features/social/api/mappers';
import { requireSupabaseSession } from '@/src/features/social/api/session';
import type { PhotoComment } from '@/src/features/social/types';

export type PhotoSocialSummary = {
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

export async function fetchPhotoSocialSummary(photoId: string): Promise<PhotoSocialSummary> {
  const { client, userId } = await requireSupabaseSession();

  const [likesResult, commentsResult, myLikeResult] = await Promise.all([
    client.from('photo_likes').select('user_id', { count: 'exact', head: true }).eq('photo_id', photoId),
    client
      .from('photo_comments')
      .select('id', { count: 'exact', head: true })
      .eq('photo_id', photoId),
    client
      .from('photo_likes')
      .select('user_id')
      .eq('photo_id', photoId)
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  if (likesResult.error) {
    throw new Error(likesResult.error.message);
  }
  if (commentsResult.error) {
    throw new Error(commentsResult.error.message);
  }
  if (myLikeResult.error) {
    throw new Error(myLikeResult.error.message);
  }

  return {
    likeCount: likesResult.count ?? 0,
    commentCount: commentsResult.count ?? 0,
    likedByMe: myLikeResult.data != null,
  };
}

export async function fetchPhotoSocialSummaries(
  photoIds: string[],
): Promise<Record<string, PhotoSocialSummary>> {
  if (photoIds.length === 0) {
    return {};
  }

  const { client, userId } = await requireSupabaseSession();

  const [likesResult, commentsResult, myLikesResult] = await Promise.all([
    client.from('photo_likes').select('photo_id').in('photo_id', photoIds),
    client.from('photo_comments').select('photo_id').in('photo_id', photoIds),
    client.from('photo_likes').select('photo_id').eq('user_id', userId).in('photo_id', photoIds),
  ]);

  if (likesResult.error) {
    throw new Error(likesResult.error.message);
  }
  if (commentsResult.error) {
    throw new Error(commentsResult.error.message);
  }
  if (myLikesResult.error) {
    throw new Error(myLikesResult.error.message);
  }

  const likeCounts = new Map<string, number>();
  const commentCounts = new Map<string, number>();
  const likedByMe = new Set((myLikesResult.data ?? []).map((row) => row.photo_id as string));

  for (const row of likesResult.data ?? []) {
    const photoId = row.photo_id as string;
    likeCounts.set(photoId, (likeCounts.get(photoId) ?? 0) + 1);
  }

  for (const row of commentsResult.data ?? []) {
    const photoId = row.photo_id as string;
    commentCounts.set(photoId, (commentCounts.get(photoId) ?? 0) + 1);
  }

  return Object.fromEntries(
    photoIds.map((photoId) => [
      photoId,
      {
        likeCount: likeCounts.get(photoId) ?? 0,
        commentCount: commentCounts.get(photoId) ?? 0,
        likedByMe: likedByMe.has(photoId),
      },
    ]),
  );
}

export async function togglePhotoLike(photoId: string): Promise<boolean> {
  const { client, userId } = await requireSupabaseSession();

  const { data: existing, error: fetchError } = await client
    .from('photo_likes')
    .select('user_id')
    .eq('photo_id', photoId)
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (existing) {
    const { error } = await client
      .from('photo_likes')
      .delete()
      .eq('photo_id', photoId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return false;
  }

  const { error } = await client.from('photo_likes').insert({
    photo_id: photoId,
    user_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function fetchPhotoComments(photoId: string): Promise<PhotoComment[]> {
  const { client } = await requireSupabaseSession();
  const { data, error } = await client
    .from('photo_comments')
    .select(
      `
      id,
      photo_id,
      user_id,
      body,
      created_at,
      profiles(display_name)
    `,
    )
    .eq('photo_id', photoId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as PhotoCommentRow[]).map(mapCommentRowToPhotoComment);
}

export async function addPhotoComment(photoId: string, body: string): Promise<PhotoComment> {
  const { client, userId } = await requireSupabaseSession();
  const trimmed = body.trim();

  if (!trimmed) {
    throw new Error('댓글 내용을 입력해 주세요.');
  }

  const { data, error } = await client
    .from('photo_comments')
    .insert({
      photo_id: photoId,
      user_id: userId,
      body: trimmed,
    })
    .select(
      `
      id,
      photo_id,
      user_id,
      body,
      created_at,
      profiles(display_name)
    `,
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapCommentRowToPhotoComment(data as PhotoCommentRow);
}
