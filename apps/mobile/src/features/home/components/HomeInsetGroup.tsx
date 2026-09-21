import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/src/constants';

type HomeInsetGroupProps = {
  children: ReactNode;
};

export function HomeInsetGroup({ children }: HomeInsetGroupProps) {
  return <View style={styles.group}>{children}</View>;
}

const styles = StyleSheet.create({
  group: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});
