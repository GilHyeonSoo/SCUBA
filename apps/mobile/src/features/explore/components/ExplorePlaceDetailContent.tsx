import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import type { ExplorePlaceDetail } from '@/src/features/explore/types';

type ExplorePlaceDetailContentProps = {
  place: ExplorePlaceDetail;
  isLoading?: boolean;
};

type InfoAction = {
  label: string;
  onPress: () => void | Promise<void>;
};

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
  actions?: InfoAction[];
};

const categoryGradients: Record<ExplorePlaceDetail['category'], readonly [string, string]> = {
  pool: ['#0090DB', '#005C96'],
  site: ['#5383E6', '#005C96'],
  shop: ['#3B6FD4', '#082B5C'],
  tour: ['#C47A18', '#8A4F0F'],
};

function verificationLabel(status?: string, sourceCount?: number): string | null {
  if (status === 'verified') {
    return sourceCount && sourceCount > 1
      ? `${sourceCount}개 출처 검증`
      : '검증 완료';
  }

  if (status === 'partial') {
    return '단일 출처';
  }

  return null;
}

function formatSubtitle(place: ExplorePlaceDetail): string {
  const parts: string[] = [place.categoryLabel];

  if (place.rawCategory) {
    const normalized = place.rawCategory.split('>').map((part) => part.trim()).filter(Boolean);
    const tail = normalized[normalized.length - 1];
    if (tail && tail !== place.categoryLabel) {
      parts.push(tail);
    }
  }

  const verification = verificationLabel(
    place.verificationStatus,
    place.verificationSourceCount,
  );
  if (verification) {
    parts.push(verification);
  }

  return parts.join(' · ');
}

function ExplorePlaceInfoRow({ icon, children, actions }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={18} color={colors.textTertiary} />
      </View>
      <View style={styles.infoBody}>
        {children}
        {actions && actions.length > 0 ? (
          <View style={styles.infoActions}>
            {actions.map((action) => (
              <Pressable key={action.label} onPress={action.onPress} hitSlop={6}>
                <AppText variant="caption" style={styles.infoActionText}>
                  {action.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function PlacePhotoGallery({ category }: { category: ExplorePlaceDetail['category'] }) {
  const gradient = categoryGradients[category];

  const photos = [
    { id: 'main', width: 300, iconSize: 40 },
    { id: 'sub-1', width: 200, iconSize: 32 },
    { id: 'sub-2', width: 200, iconSize: 32 },
  ] as const;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.photoRow}>
      {photos.map((photo) => (
        <LinearGradient
          key={photo.id}
          colors={[...gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.photoCard, { width: photo.width }]}>
          <Ionicons
            name={
              category === 'pool'
                ? 'water'
                : category === 'site'
                  ? 'location'
                  : category === 'shop'
                    ? 'storefront'
                    : 'boat'
            }
            size={photo.iconSize}
            color="rgba(255,255,255,0.9)"
          />
        </LinearGradient>
      ))}
    </ScrollView>
  );
}

export function ExplorePlaceDetailContent({
  place,
  isLoading = false,
}: ExplorePlaceDetailContentProps) {
  const subtitle = useMemo(() => formatSubtitle(place), [place]);

  const openLink = async (url?: string) => {
    if (!url) {
      return;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  const mapActions: InfoAction[] = [];
  if (place.naverMapUrl) {
    mapActions.push({ label: '네이버 지도', onPress: () => void openLink(place.naverMapUrl) });
  }
  if (place.kakaoMapUrl) {
    mapActions.push({ label: '카카오맵', onPress: () => void openLink(place.kakaoMapUrl) });
  }
  if (place.googleMapsUrl) {
    mapActions.push({ label: 'Google 지도', onPress: () => void openLink(place.googleMapsUrl) });
  }

  const regionLine = [place.region, place.city].filter(Boolean).join(' ');

  return (
    <View style={styles.content}>
      <View style={styles.titleBlock}>
        <AppText variant="h1" style={styles.name}>
          {place.name}
        </AppText>
        <AppText variant="bodySmall" style={styles.subtitle}>
          {subtitle}
        </AppText>
      </View>

      <PlacePhotoGallery category={place.category} />

      <View style={styles.infoSection}>
        <ExplorePlaceInfoRow
          icon="location-outline"
          actions={mapActions.length > 0 ? mapActions : undefined}>
          <AppText variant="body" style={styles.infoText}>
            {place.address}
          </AppText>
          {regionLine ? (
            <AppText variant="caption" style={styles.infoMeta}>
              {regionLine}
            </AppText>
          ) : null}
        </ExplorePlaceInfoRow>

        {place.phone ? (
          <ExplorePlaceInfoRow
            icon="call-outline"
            actions={[{ label: '전화', onPress: () => openLink(`tel:${place.phone}`) }]}>
            <AppText variant="body" style={styles.infoText}>
              {place.phone}
            </AppText>
          </ExplorePlaceInfoRow>
        ) : null}

        {place.website ? (
          <ExplorePlaceInfoRow
            icon="globe-outline"
            actions={[{ label: '열기', onPress: () => openLink(place.website) }]}>
            <AppText variant="body" style={styles.linkText} numberOfLines={2}>
              {place.website}
            </AppText>
          </ExplorePlaceInfoRow>
        ) : null}

        {place.rawCategory ? (
          <ExplorePlaceInfoRow icon="pricetag-outline">
            <AppText variant="body" style={styles.infoText}>
              {place.rawCategory.replace(/>/g, ' · ')}
            </AppText>
          </ExplorePlaceInfoRow>
        ) : null}

        <ExplorePlaceInfoRow icon="navigate-outline">
          <AppText variant="body" style={styles.infoText}>
            {`${place.latitude.toFixed(5)}, ${place.longitude.toFixed(5)}`}
          </AppText>
        </ExplorePlaceInfoRow>
      </View>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="caption" style={styles.loadingText}>
            상세 정보를 불러오는 중입니다.
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const photoHeight = 204;

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  titleBlock: {
    gap: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
  },
  photoRow: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  photoCard: {
    height: photoHeight,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  infoIconWrap: {
    width: 24,
    paddingTop: 2,
    alignItems: 'center',
  },
  infoBody: {
    flex: 1,
    gap: spacing.xs,
  },
  infoText: {
    color: colors.textPrimary,
    lineHeight: 22,
  },
  infoMeta: {
    color: colors.textTertiary,
  },
  infoActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  infoActionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  linkText: {
    color: colors.primary,
    fontWeight: '500',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
  },
});
