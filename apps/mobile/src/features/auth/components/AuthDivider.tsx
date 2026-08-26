import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';

export function AuthDivider({ label = '또는' }: { label?: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.sm,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  label: {
    color: colors.textTertiary,
  },
});
