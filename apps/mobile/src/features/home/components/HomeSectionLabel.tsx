import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';

type HomeSectionLabelProps = {
  label: string;
  marginTop?: number;
};

export function HomeSectionLabel({ label, marginTop = spacing.xl }: HomeSectionLabelProps) {
  return (
    <View style={[styles.container, { marginTop }]}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
