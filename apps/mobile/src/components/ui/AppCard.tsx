import { ReactNode } from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '@/src/constants';
import { PressableScale } from '@/src/components/motion/PressableScale';

type AppCardVariant = 'default' | 'soft' | 'outline' | 'ghost';

type AppCardProps = ViewProps & {
  variant?: AppCardVariant;
  elevated?: boolean;
  pressable?: boolean;
  onPress?: () => void;
  children: ReactNode;
};

const variantStyles: Record<AppCardVariant, ViewStyle> = {
  default: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderLight,
  },
  soft: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
  },
  outline: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
  },
};

export function AppCard({
  variant = 'default',
  elevated = false,
  pressable = false,
  onPress,
  style,
  children,
  ...props
}: AppCardProps) {
  const cardStyle = [
    styles.card,
    variantStyles[variant],
    elevated && styles.elevated,
    elevated && shadows.sm,
    style,
  ];

  if (pressable || onPress) {
    return (
      <PressableScale onPress={onPress} style={cardStyle}>
        {children}
      </PressableScale>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: colors.white,
  },
});
