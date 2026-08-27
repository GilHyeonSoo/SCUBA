import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';

import { AppBadge, AppCard, AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import type { GearCatalogProduct } from '@/src/features/gear/types';
import { formatGearPrice } from '@/src/features/gear/utils/format-price';

type GearCatalogCardProps = {
  product: GearCatalogProduct;
  selected?: boolean;
  onPress: () => void;
};

const diveTypeLabel = {
  scuba: '스킨스쿠버',
  freediving: '프리다이빙',
} as const;

export function GearCatalogCard({ product, selected = false, onPress }: GearCatalogCardProps) {
  const showBrand = product.brandName !== 'Unknown';

  return (
    <AppCard
      pressable
      elevated
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}>
      <View style={styles.imageWrap}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={28} color={colors.textTertiary} />
          </View>
        )}
        <View style={styles.badgeWrap}>
          <AppBadge label={diveTypeLabel[product.diveType]} tone="default" />
        </View>
        {selected ? (
          <View style={styles.selectedOverlay}>
            <Ionicons name="checkmark-circle" size={28} color={colors.white} />
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        {showBrand ? (
          <AppText variant="label" color="primary" numberOfLines={1} style={styles.brand}>
            {product.brandName}
          </AppText>
        ) : null}
        <AppText variant="label" numberOfLines={2} style={styles.title}>
          {product.title}
        </AppText>
        <AppText variant="bodySmall" color="primary" style={styles.price}>
          {formatGearPrice(product.price, product.currency)}
        </AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.sm,
    gap: spacing.sm,
    minHeight: 220,
  },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  badgeWrap: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 43, 92, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: 4,
    flex: 1,
  },
  brand: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  title: {
    minHeight: 36,
  },
  price: {
    fontWeight: '700',
  },
});
