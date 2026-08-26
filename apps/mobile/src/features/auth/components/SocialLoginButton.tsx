import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { PressableScale } from '@/src/components/motion/PressableScale';
import { AppText } from '@/src/components/ui';
import { radius, shadows, spacing } from '@/src/constants';
import { SocialAuthProviderConfig } from '@/src/features/auth/types';

type SocialLoginButtonProps = {
  provider: SocialAuthProviderConfig;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function SocialLoginButton({
  provider,
  onPress,
  loading = false,
  disabled = false,
}: SocialLoginButtonProps) {
  const isDisabled = disabled || loading;
  const hasBorder = Boolean(provider.borderColor);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={provider.label}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: provider.backgroundColor,
          borderColor: provider.borderColor ?? provider.backgroundColor,
        },
        hasBorder && shadows.sm,
        isDisabled && styles.disabled,
      ]}>
      {loading ? (
        <ActivityIndicator color={provider.textColor} />
      ) : (
        <>
          <View style={styles.iconSlot}>
            {provider.id === 'apple' ? (
              <Ionicons name="logo-apple" size={20} color={provider.textColor} />
            ) : (
              <AppText
                variant="label"
                style={[styles.iconLabel, { color: provider.textColor }]}>
                {provider.iconLabel}
              </AppText>
            )}
          </View>
          <AppText
            variant="label"
            style={[styles.label, { color: provider.textColor }]}>
            {provider.label}
          </AppText>
        </>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  iconSlot: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  disabled: {
    opacity: 0.6,
  },
});
