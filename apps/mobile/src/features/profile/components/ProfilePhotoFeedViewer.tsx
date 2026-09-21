import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItem,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import { ProfilePhotoCommentsSheet } from '@/src/features/profile/components/ProfilePhotoCommentsSheet';
import type { ProfileGalleryImage } from '@/src/features/profile/types';
import { usePhotoSocialState } from '@/src/features/social/hooks/usePhotoSocialState';

type ProfilePhotoFeedViewerProps = {
  images: ProfileGalleryImage[];
  initialIndex: number;
  visible: boolean;
  ownerDisplayName: string;
  commentAuthorDisplayName?: string;
  isOwnGallery?: boolean;
  onClose: () => void;
  onDeleteImage?: (imageId: string) => void;
};

type SlideProps = {
  image: ProfileGalleryImage;
  slideHeight: number;
  ownerDisplayName: string;
  onLikePress: () => void;
  onCommentPress: () => void;
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
};

function ProfilePhotoSlide({
  image,
  slideHeight,
  ownerDisplayName,
  onLikePress,
  onCommentPress,
  isLiked,
  likeCount,
  commentCount,
}: SlideProps) {
  return (
    <View style={[styles.slide, { height: slideHeight }]}>
      <Image source={{ uri: image.uri }} style={styles.image} resizeMode="contain" />

      <View style={styles.bottomOverlay}>
        <AppText variant="label" style={styles.ownerName}>
          {ownerDisplayName}
        </AppText>
        {image.caption ? (
          <AppText variant="bodySmall" style={styles.caption}>
            {image.caption}
          </AppText>
        ) : null}

        <View style={styles.actionsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="좋아요"
            onPress={onLikePress}
            style={styles.actionButton}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? colors.error : colors.white}
            />
            <AppText variant="caption" style={styles.actionLabel}>
              {likeCount}
            </AppText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="댓글"
            onPress={onCommentPress}
            style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={21} color={colors.white} />
            <AppText variant="caption" style={styles.actionLabel}>
              {commentCount}
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function ProfilePhotoFeedViewer({
  images,
  initialIndex,
  visible,
  ownerDisplayName,
  commentAuthorDisplayName,
  isOwnGallery = false,
  onClose,
  onDeleteImage,
}: ProfilePhotoFeedViewerProps) {
  const insets = useSafeAreaInsets();
  const slideHeight = Dimensions.get('window').height;
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [commentsPhotoId, setCommentsPhotoId] = useState<string | null>(null);

  const photoIds = useMemo(() => images.map((image) => image.id), [images]);
  const { isLiked, getLikeCount, getCommentCount, toggleLike, summariesQuery } =
    usePhotoSocialState(photoIds);

  const listExtraData = useMemo(
    () => ({ socialSummaries: summariesQuery.data, activeIndex }),
    [activeIndex, summariesQuery.data],
  );

  const activeImage = images[activeIndex] ?? null;

  const handleDelete = useCallback(() => {
    if (!activeImage || !onDeleteImage) {
      return;
    }

    Alert.alert('사진 삭제', '이 사진을 프로필에서 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          onDeleteImage(activeImage.id);
          if (images.length <= 1) {
            onClose();
            return;
          }

          setActiveIndex((current) => Math.min(current, images.length - 2));
        },
      },
    ]);
  }, [activeImage, images.length, onClose, onDeleteImage]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const nextIndex = viewableItems[0]?.index;
      if (typeof nextIndex === 'number') {
        setActiveIndex(nextIndex);
      }
    },
    [],
  );

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 80,
    }),
    [],
  );

  const renderItem: ListRenderItem<ProfileGalleryImage> = useCallback(
    ({ item }) => (
      <ProfilePhotoSlide
        image={item}
        slideHeight={slideHeight}
        ownerDisplayName={ownerDisplayName}
        onLikePress={() => toggleLike(item.id)}
        onCommentPress={() => setCommentsPhotoId(item.id)}
        isLiked={isLiked(item.id)}
        likeCount={getLikeCount(item.id)}
        commentCount={getCommentCount(item.id)}
      />
    ),
    [getCommentCount, getLikeCount, isLiked, ownerDisplayName, slideHeight, toggleLike],
  );

  if (!visible || images.length === 0) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.container}>
        <FlatList
          data={images}
          extraData={listExtraData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          pagingEnabled
          initialScrollIndex={Math.min(initialIndex, Math.max(images.length - 1, 0))}
          getItemLayout={(_, index) => ({
            length: slideHeight,
            offset: slideHeight * index,
            index,
          })}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />

        <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="닫기"
            hitSlop={8}
            onPress={onClose}
            style={styles.iconButton}>
            <Ionicons name="chevron-back" size={28} color={colors.white} />
          </Pressable>

          {isOwnGallery && onDeleteImage ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="사진 삭제"
              hitSlop={8}
              onPress={handleDelete}
              style={styles.iconButton}>
              <Ionicons name="trash-outline" size={22} color={colors.white} />
            </Pressable>
          ) : (
            <View style={styles.iconButton} />
          )}
        </View>

        <ProfilePhotoCommentsSheet
          photoId={commentsPhotoId}
          visible={commentsPhotoId != null}
          onClose={() => setCommentsPhotoId(null)}
          authorDisplayName={commentAuthorDisplayName ?? ownerDisplayName}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  slide: {
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    paddingTop: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    gap: spacing.xs,
  },
  ownerName: {
    color: colors.white,
    fontSize: 15,
  },
  caption: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  actionLabel: {
    color: colors.white,
    fontSize: 13,
  },
});
