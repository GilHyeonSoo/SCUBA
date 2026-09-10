import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';

type MeetingMetaTagProps = {
  label: string;
};

export function MeetingMetaTag({ label }: MeetingMetaTagProps) {
  return (
    <View style={styles.tag}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
  },
  label: {
    color: colors.primaryStrong,
    fontWeight: '600',
  },
});
