import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/src/constants';

type ProfileAvatarProps = {
  imageUrl: string | null;
  size?: number;
  editable?: boolean;
  onPress?: () => void;
};

export function ProfileAvatar({
  imageUrl,
  size = 76,
  editable = false,
  onPress,
}: ProfileAvatarProps) {
  const radius = size / 2;
  const iconSize = Math.round(size * 0.4);
  const editBadgeSize = Math.max(24, Math.round(size * 0.28));

  const content = (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: radius,
        },
      ]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { width: size, height: size, borderRadius: radius }]}
          accessibilityLabel="프로필 사진"
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size,
              height: size,
              borderRadius: radius,
            },
          ]}>
          <Ionicons name="person" size={iconSize} color={colors.primary} />
        </View>
      )}

      {editable ? (
        <View
          style={[
            styles.editBadge,
            {
              width: editBadgeSize,
              height: editBadgeSize,
              borderRadius: editBadgeSize / 2,
            },
          ]}>
          <Ionicons name="camera" size={Math.round(editBadgeSize * 0.55)} color={colors.white} />
        </View>
      ) : null}
    </View>
  );

  if (!editable || !onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="프로필 사진 변경"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    borderWidth: 2,
    borderColor: colors.primaryMuted,
  },
  placeholder: {
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryMuted,
  },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  pressed: {
    opacity: 0.9,
  },
});
