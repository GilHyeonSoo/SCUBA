import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';

export function HomeExpeditionRibbon() {
  return (
    <View style={styles.ribbon}>
      <AppText variant="caption" style={styles.ribbonText}>
        NEXT EXPEDITION
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  ribbon: {
    height: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  ribbonText: {
    color: colors.textOnPrimary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});
