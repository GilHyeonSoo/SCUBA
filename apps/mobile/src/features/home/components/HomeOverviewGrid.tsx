import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import { HomeOverviewFeaturedContent } from '@/src/features/home/components/HomeOverviewFeaturedContent';
import type { HomeOverviewPanel } from '@/src/features/home/types/home-overview';

export type HomeOverviewTile = {
  id: string;
  label: string;
  value: string;
  valueUnit?: string;
  hint?: string;
  panel: HomeOverviewPanel;
  onPress?: () => void;
};

type HomeOverviewGridProps = {
  tiles: HomeOverviewTile[];
  defaultFeaturedId?: string;
};

function CompactTileContent({ tile }: { tile: HomeOverviewTile }) {
  const showSplitValue = tile.valueUnit != null;

  return (
    <>
      <View style={styles.compactTopRow}>
        <AppText variant="caption" style={styles.compactLabel}>
          {tile.label}
        </AppText>
        <Ionicons name="chevron-up" size={14} color={colors.primary} />
      </View>
      {showSplitValue ? (
        <View style={styles.valueRow}>
          <AppText variant="h2" style={styles.compactValueNumber}>
            {tile.value}
          </AppText>
          <AppText variant="label" style={styles.compactValueUnit}>
            {tile.valueUnit}
          </AppText>
        </View>
      ) : (
        <AppText variant="h2" style={styles.compactValueText} numberOfLines={1}>
          {tile.value}
        </AppText>
      )}
      {tile.hint ? (
        <AppText variant="caption" style={styles.compactHint} numberOfLines={1}>
          {tile.hint}
        </AppText>
      ) : null}
      <AppText variant="caption" style={styles.compactTapHint}>
        탭하여 메인으로
      </AppText>
    </>
  );
}

export function HomeOverviewGrid({ tiles, defaultFeaturedId }: HomeOverviewGridProps) {
  const initialFeaturedId = defaultFeaturedId ?? tiles[0]?.id ?? '';
  const [featuredId, setFeaturedId] = useState(initialFeaturedId);

  const featuredTile = useMemo(
    () => tiles.find((tile) => tile.id === featuredId) ?? tiles[0],
    [featuredId, tiles],
  );

  const secondaryTiles = useMemo(
    () => tiles.filter((tile) => tile.id !== featuredTile?.id),
    [featuredTile?.id, tiles],
  );

  if (!featuredTile) {
    return null;
  }

  return (
    <View style={styles.panel}>
      <View style={styles.featuredHeader}>
        <AppText variant="caption" style={styles.featuredHeaderLabel}>
          {featuredTile.label}
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!featuredTile.onPress}
        onPress={featuredTile.onPress}
        style={({ pressed }) => [
          styles.featuredTile,
          pressed && featuredTile.onPress && styles.featuredTilePressed,
        ]}>
        <HomeOverviewFeaturedContent panel={featuredTile.panel} />
      </Pressable>

      <View style={styles.compactRow}>
        {secondaryTiles.map((tile) => (
          <Pressable
            key={tile.id}
            accessibilityRole="button"
            accessibilityLabel={`${tile.label} 메인으로 보기`}
            onPress={() => setFeaturedId(tile.id)}
            style={({ pressed }) => [
              styles.compactTile,
              pressed && styles.compactTilePressed,
            ]}>
            <CompactTileContent tile={tile} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  featuredHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  featuredHeaderLabel: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  featuredTile: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    minHeight: 220,
  },
  featuredTilePressed: {
    opacity: 0.92,
  },
  compactRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  compactTile: {
    flex: 1,
    minHeight: 112,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    gap: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  compactTilePressed: {
    opacity: 0.88,
    borderColor: colors.primaryStrong,
    borderWidth: 2,
  },
  compactTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  compactLabel: {
    color: colors.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  compactValueNumber: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  compactValueUnit: {
    fontSize: 15,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 1,
  },
  compactValueText: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  compactHint: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  compactTapHint: {
    color: colors.primary,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
});
