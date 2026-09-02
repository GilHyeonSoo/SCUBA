import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius } from '@/src/constants';
import { meetingCategoryLabels } from '@/src/features/tour/constants';
import type { DiveMeeting } from '@/src/features/tour/types';

type MeetingCoverImageProps = {
  meeting: DiveMeeting;
  edgeToEdge?: boolean;
};

const environmentIcons = {
  pool: 'water-outline',
  sea: 'boat-outline',
} as const satisfies Record<DiveMeeting['environment'], keyof typeof Ionicons.glyphMap>;

const environmentGradients = {
  pool: [colors.primarySoft, colors.primaryMuted, colors.oceanLight],
  sea: [colors.primaryMuted, colors.primaryMid, colors.primaryStrong],
} as const;

export function MeetingCoverImage({ meeting, edgeToEdge = false }: MeetingCoverImageProps) {
  const imageStyle = [styles.image, edgeToEdge && styles.imageEdgeToEdge];
  const placeholderStyle = [styles.placeholder, edgeToEdge && styles.imageEdgeToEdge];

  if (meeting.coverImageUrl) {
    return (
      <Image
        source={{ uri: meeting.coverImageUrl }}
        style={imageStyle}
        resizeMode="cover"
        accessibilityLabel={`${meeting.title} 대표 이미지`}
      />
    );
  }

  const iconName = environmentIcons[meeting.environment];
  const gradientColors = environmentGradients[meeting.environment];

  return (
    <LinearGradient colors={[...gradientColors]} style={placeholderStyle}>
      <Ionicons name={iconName} size={36} color={colors.white} />
      <AppText variant="caption" style={styles.placeholderLabel}>
        {meetingCategoryLabels[meeting.category]}
      </AppText>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 168,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  placeholder: {
    width: '100%',
    height: 168,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imageEdgeToEdge: {
    borderRadius: 0,
    height: 200,
  },
  placeholderLabel: {
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
