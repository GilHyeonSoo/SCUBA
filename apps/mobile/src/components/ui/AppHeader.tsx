import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, gradients, layout, spacing } from '@/src/constants';
import { AppText } from './AppText';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
  onBack?: () => void;
  variant?: 'default' | 'hero' | 'brand';
};

export function AppHeader({
  title,
  subtitle,
  rightElement,
  onBack,
  variant = 'default',
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const isHero = variant === 'hero';
  const isBrand = variant === 'brand';

  const titleBlock = (
    <View style={[styles.textBlock, isBrand && styles.brandTextBlock]}>
      {isHero ? (
        <AppText variant="caption" style={styles.heroEyebrow}>
          DIVE PLATFORM
        </AppText>
      ) : null}
      {isBrand ? (
        <AppText variant="h2" color="primary" style={styles.brandTitle}>
          {title}
        </AppText>
      ) : (
        <AppText variant={isHero ? 'display' : 'h1'} style={isHero ? styles.heroTitle : undefined}>
          {title}
        </AppText>
      )}
      {subtitle && !isBrand ? (
        <AppText
          variant="bodySmall"
          style={[styles.subtitle, isHero && styles.heroSubtitle]}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );

  const content = onBack ? (
    <View style={styles.backRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="홈으로 돌아가기"
        onPress={onBack}
        hitSlop={8}
        style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </Pressable>
      <View style={styles.backTitleBlock}>{titleBlock}</View>
      {rightElement ? <View style={styles.rightSlot}>{rightElement}</View> : null}
    </View>
  ) : (
    <View style={[styles.row, isHero && styles.heroRow, isBrand && styles.brandRow]}>
      {titleBlock}
      {rightElement}
    </View>
  );

  if (isHero) {
    return (
      <LinearGradient
        colors={[...gradients.heroSoft]}
        style={[styles.heroContainer, { paddingTop: insets.top + spacing.lg }]}>
        {content}
        <View style={styles.heroAccent} />
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        isBrand ? styles.brandContainer : styles.container,
        { paddingTop: insets.top + (isBrand ? spacing.xs : spacing.md) },
      ]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  } satisfies ViewStyle,
  brandContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.xs,
    backgroundColor: colors.background,
  },
  heroContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
  },
  heroAccent: {
    position: 'absolute',
    right: -40,
    top: 20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primaryMuted,
    opacity: 0.35,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  backTitleBlock: {
    flex: 1,
  },
  rightSlot: {
    marginTop: spacing.xs,
  },
  heroRow: {
    alignItems: 'center',
  },
  brandRow: {
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  brandTextBlock: {
    alignItems: 'center',
  },
  brandTitle: {
    letterSpacing: 3,
    fontWeight: '800',
    fontSize: 22,
    lineHeight: 28,
  },
  heroEyebrow: {
    letterSpacing: 2,
    color: colors.ocean,
    fontWeight: '600',
  },
  heroTitle: {
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
