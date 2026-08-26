import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { animation, colors, radius, spacing, typography } from '@/src/constants';
import { AppText } from './AppText';

type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function AppInput({ label, error, style, onFocus, onBlur, ...props }: AppInputProps) {
  const focused = useSharedValue(0);

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor: withTiming(
      focused.value ? colors.primary : error ? colors.error : colors.border,
      { duration: animation.fast },
    ),
    backgroundColor: withTiming(
      focused.value ? colors.white : colors.surface,
      { duration: animation.fast },
    ),
  }));

  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <Animated.View style={[styles.inputWrap, animatedBorder, error ? styles.inputErrorWrap : undefined]}>
        <TextInput
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, style]}
          onFocus={(event) => {
            focused.value = 1;
            onFocus?.(event);
          }}
          onBlur={(event) => {
            focused.value = 0;
            onBlur?.(event);
          }}
          {...props}
        />
      </Animated.View>
      {error ? (
        <AppText variant="caption" color="error" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputWrap: {
    borderWidth: 1,
    borderRadius: radius.md,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  inputErrorWrap: {
    borderColor: colors.error,
  },
  input: {
    ...typography.body,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 50,
    color: colors.textPrimary,
  },
  error: {
    marginTop: spacing.xs,
  },
});
