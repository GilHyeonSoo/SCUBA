import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppText } from '@/src/components/ui';
import { colors, layout, spacing } from '@/src/constants';
import { ProfileAvatar } from '@/src/features/profile/components/ProfileAvatar';
import { ProfileGalleryGrid } from '@/src/features/profile/components/ProfileGalleryGrid';
import { ProfilePhotoFeedViewer } from '@/src/features/profile/components/ProfilePhotoFeedViewer';
import { ProfileStatsRow } from '@/src/features/profile/components/ProfileStatsRow';
import { useMyGalleryRemote } from '@/src/features/profile/hooks/useGalleryRemote';
import { useMyProfileRemote } from '@/src/features/profile/hooks/useProfileRemote';
import { openGalleryImagePicker } from '@/src/features/profile/services/profile-image-picker';
import { useProfileGalleryStore } from '@/src/features/profile/stores/profile-gallery-store';
import { useProfileStore } from '@/src/features/profile/stores/profile-store';
import type { ProfileGalleryImage } from '@/src/features/profile/types';
import { getProfileDisciplineLines } from '@/src/features/profile/utils';
import { CURRENT_USER_ID } from '@/src/features/social/constants';
import { useMyFollowStatsRemote } from '@/src/features/social/hooks/useFollowRemote';
import { useFollowStore } from '@/src/features/social/stores/follow-store';

export default function MyScreen() {
  const router = useRouter();
  useMyProfileRemote();

  const profile = useProfileStore((state) => state.profile);
  const galleryImages = useProfileGalleryStore((state) => state.images);
  const removeImage = useProfileGalleryStore((state) => state.removeImage);
  const addImage = useProfileGalleryStore((state) => state.addImage);
  const followingIds = useFollowStore((state) => state.followingIds);

  const {
    isRemote: isRemoteGallery,
    uploadPhoto,
    deletePhoto,
    isUploading,
  } = useMyGalleryRemote();
  const { data: remoteFollowStats } = useMyFollowStatsRemote();

  const disciplineLines = getProfileDisciplineLines(profile);
  const [viewerState, setViewerState] = useState<{ index: number } | null>(null);

  const stats = useMemo(() => {
    if (remoteFollowStats) {
      return {
        posts: remoteFollowStats.postCount,
        followers: remoteFollowStats.followerCount,
        following: remoteFollowStats.followingCount,
      };
    }

    const followStore = useFollowStore.getState();
    return {
      posts: galleryImages.length,
      followers: followStore.getFollowerCount(CURRENT_USER_ID),
      following: followStore.getFollowingCount(CURRENT_USER_ID),
    };
  }, [galleryImages.length, followingIds, remoteFollowStats]);

  const openDiverProfile = useCallback(() => {
    router.push('/(tabs)/my/profile');
  }, [router]);

  const openGear = useCallback(() => {
    router.push('/(tabs)/my/gear');
  }, [router]);

  const openSettings = useCallback(() => {
    Alert.alert('준비 중', '설정 기능은 곧 제공됩니다.');
  }, []);

  const openImage = useCallback((_: ProfileGalleryImage, index: number) => {
    setViewerState({ index });
  }, []);

  const handleAddImage = useCallback(() => {
    openGalleryImagePicker(async (uri) => {
      if (isRemoteGallery) {
        try {
          await uploadPhoto(uri);
        } catch (error) {
          Alert.alert(
            '업로드 실패',
            error instanceof Error ? error.message : '사진을 업로드하지 못했습니다.',
          );
        }
        return;
      }

      addImage(uri);
    });
  }, [addImage, isRemoteGallery, uploadPhoto]);

  const handleDeleteImage = useCallback(
    async (imageId: string) => {
      if (isRemoteGallery) {
        try {
          await deletePhoto(imageId);
        } catch (error) {
          Alert.alert(
            '삭제 실패',
            error instanceof Error ? error.message : '사진을 삭제하지 못했습니다.',
          );
        }
        return;
      }

      removeImage(imageId);
    },
    [deletePhoto, isRemoteGallery, removeImage],
  );

  return (
    <ScreenLayout contentContainerStyle={styles.content} contentTopSpacing={spacing.xl}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="다이버 프로필 열기"
        onPress={openDiverProfile}
        style={({ pressed }) => [styles.profileSection, pressed && styles.profileSectionPressed]}>
        <View style={styles.profileRow}>
          <ProfileAvatar imageUrl={profile.profileImageUrl} size={88} />
          <View style={styles.identityBlock}>
            <AppText variant="h2" style={styles.name}>
              {profile.displayName}
            </AppText>
            <View style={styles.disciplineBlock}>
              {disciplineLines.map((line) => (
                <AppText key={line} variant="bodySmall" style={styles.disciplineText}>
                  {line}
                </AppText>
              ))}
            </View>
            {profile.bio ? (
              <AppText variant="bodySmall" style={styles.bio}>
                {profile.bio}
              </AppText>
            ) : null}
          </View>
        </View>
      </Pressable>

      <ProfileStatsRow
        postCount={stats.posts}
        followerCount={stats.followers}
        followingCount={stats.following}
        onFollowersPress={() => router.push('/(tabs)/my/followers')}
        onFollowingPress={() => router.push('/(tabs)/my/following')}
      />

      <View style={styles.iconBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="내 장비"
          onPress={openGear}
          style={({ pressed }) => [styles.iconAction, pressed && styles.iconActionPressed]}>
          <AppText variant="label" style={styles.iconLabel}>
            장비
          </AppText>
        </Pressable>
        <View style={styles.iconBarDivider} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="설정"
          onPress={openSettings}
          style={({ pressed }) => [styles.iconAction, pressed && styles.iconActionPressed]}>
          <AppText variant="label" style={styles.iconLabel}>
            설정
          </AppText>
        </Pressable>
      </View>

      <ProfileGalleryGrid
        onImagePress={openImage}
        onAddImage={handleAddImage}
        isAdding={isUploading}
      />

      <ProfilePhotoFeedViewer
        images={galleryImages}
        initialIndex={viewerState?.index ?? 0}
        visible={viewerState != null}
        ownerDisplayName={profile.displayName}
        commentAuthorDisplayName={profile.displayName}
        isOwnGallery
        onClose={() => setViewerState(null)}
        onDeleteImage={handleDeleteImage}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    gap: 0,
  },
  profileSection: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  profileSectionPressed: {
    opacity: 0.7,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  identityBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: 20,
    lineHeight: 26,
  },
  disciplineBlock: {
    gap: 2,
  },
  disciplineText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  bio: {
    color: colors.textPrimary,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  iconBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    marginBottom: spacing.xs,
  },
  iconAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  iconActionPressed: {
    opacity: 0.6,
  },
  iconLabel: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  iconBarDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
});
