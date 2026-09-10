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
  variant?: 'featured' | 'thumbnail' | 'hero';
};

const environmentIcons = {
  pool: 'water-outline',
  sea: 'boat-outline',
} as const satisfies Record<DiveMeeting['environment'], keyof typeof Ionicons.glyphMap>;

const environmentGradients = {
  pool: [colors.primarySoft, colors.primaryMuted, colors.oceanLight],
  sea: [colors.primaryMuted, colors.primaryMid, colors.primaryStrong],
} as const;

export function MeetingCoverImage({
  meeting,
  edgeToEdge = false,
  variant = 'featured',
}: MeetingCoverImageProps) {
  const isThumbnail = variant === 'thumbnail';
  const isHero = variant === 'hero';
  const imageStyle = [
    styles.image,
    isThumbnail && styles.imageThumbnail,
    isHero && styles.imageHero,
    edgeToEdge && styles.imageEdgeToEdge,
  ];
  const placeholderStyle = [
    styles.placeholder,
    isThumbnail && styles.imageThumbnail,
    isHero && styles.imageHero,
    edgeToEdge && styles.imageEdgeToEdge,
  ];

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
      <Ionicons
        name={iconName}
        size={isThumbnail ? 22 : isHero ? 48 : 36}
        color={colors.white}
      />
      {!isThumbnail && !isHero ? (
        <AppText variant="caption" style={styles.placeholderLabel}>
          {meetingCategoryLabels[meeting.category]}
        </AppText>
      ) : null}
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
  imageThumbnail: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
  },
  imageHero: {
    width: '100%',
    height: 224,
    borderRadius: 0,
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
