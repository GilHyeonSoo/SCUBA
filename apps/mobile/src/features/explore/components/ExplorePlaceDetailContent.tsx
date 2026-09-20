import { Ionicons } from '@expo/vector-icons';
import { useMemo, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import { ExploreOperatingHoursTable } from '@/src/features/explore/components/ExploreOperatingHoursTable';
import { ExplorePlacePhotoGallery } from '@/src/features/explore/components/ExplorePlacePhotoGallery';
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

  if (place.enrichment?.knownDataApplied?.verified) {
    parts.push('공식 정보 확인');
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

      <ExplorePlacePhotoGallery category={place.category} images={place.images} />

      {place.shortDescription ? (
        <AppText variant="body" style={styles.description}>
          {place.shortDescription}
        </AppText>
      ) : null}

      {place.operatingHours && place.operatingHours.length > 0 ? (
        <View style={styles.highlightSection}>
          <AppText variant="label" style={styles.sectionTitle}>
            운영 시간
          </AppText>
          <ExploreOperatingHoursTable rows={place.operatingHours} />
        </View>
      ) : null}

      {place.highlights.length > 0 ? (
        <View style={styles.highlightSection}>
          <AppText variant="label" style={styles.sectionTitle}>
            상세 정보
          </AppText>
          {place.highlights.map((highlight) => (
            <View key={`${highlight.label}-${highlight.value}`} style={styles.highlightRow}>
              <AppText variant="caption" style={styles.highlightLabel}>
                {highlight.label}
              </AppText>
              <AppText variant="body" style={styles.highlightValue}>
                {highlight.value}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

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
  description: {
    color: colors.textPrimary,
    lineHeight: 22,
  },
  highlightSection: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  highlightRow: {
    gap: 2,
  },
  highlightLabel: {
    color: colors.textTertiary,
    fontWeight: '600',
  },
  highlightValue: {
    color: colors.textPrimary,
    lineHeight: 22,
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
