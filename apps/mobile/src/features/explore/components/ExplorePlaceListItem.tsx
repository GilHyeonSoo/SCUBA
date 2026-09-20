import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import type { ExplorePlace } from '@/src/features/explore/types';

const categoryIcons = {
  pool: 'water',
  site: 'location',
  shop: 'storefront',
  tour: 'boat',
} as const satisfies Record<ExplorePlace['category'], keyof typeof Ionicons.glyphMap>;

type ExplorePlaceListItemProps = {
  place: ExplorePlace;
  onPress?: () => void;
};

export function ExplorePlaceListItem({ place, onPress }: ExplorePlaceListItemProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const metaParts = [place.categoryLabel, place.address];
  if (place.shortDescription) {
    metaParts.push(place.shortDescription);
  }

  const showThumbnail = Boolean(place.primaryImageUrl) && !imageFailed;

  return (
    <Pressable onPress={onPress} style={styles.row}>
      {showThumbnail ? (
        <Image
          source={{ uri: place.primaryImageUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={styles.iconWrap}>
          <Ionicons name={categoryIcons[place.category]} size={18} color={colors.primary} />
        </View>
      )}
      <View style={styles.content}>
        <AppText variant="body" style={styles.name}>
          {place.name}
        </AppText>
        <AppText variant="caption" style={styles.meta} numberOfLines={2}>
          {metaParts.join(' · ')}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  meta: {
    color: colors.textSecondary,
  },
});
