import { Ionicons } from '@expo/vector-icons';
import { Alert, Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import { useProfileGalleryStore } from '@/src/features/profile/stores/profile-gallery-store';
import type { ProfileGalleryImage } from '@/src/features/profile/types';

type ProfileGalleryViewerProps = {
  image: ProfileGalleryImage | null;
  onClose: () => void;
};

export function ProfileGalleryViewer({ image, onClose }: ProfileGalleryViewerProps) {
  const insets = useSafeAreaInsets();
  const removeImage = useProfileGalleryStore((state) => state.removeImage);

  const handleDelete = () => {
    if (!image) {
      return;
    }

    Alert.alert('사진 삭제', '이 사진을 프로필에서 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          removeImage(image.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={image != null}>
      <View style={styles.overlay}>
        <View style={[styles.toolbar, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="닫기"
            hitSlop={8}
            onPress={onClose}
            style={styles.iconButton}>
            <Ionicons name="close" size={28} color={colors.white} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="사진 삭제"
            hitSlop={8}
            onPress={handleDelete}
            style={styles.iconButton}>
            <Ionicons name="trash-outline" size={24} color={colors.white} />
          </Pressable>
        </View>

        {image ? (
          <Image
            accessibilityLabel="프로필 사진 확대"
            source={{ uri: image.uri }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : null}

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <AppText variant="caption" style={styles.footerText}>
            사진을 삭제하려면 상단 휴지통을 눌러주세요.
          </AppText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.96)',
  },
  toolbar: {
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
  image: {
    flex: 1,
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
  },
});
