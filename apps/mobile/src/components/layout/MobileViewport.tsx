import { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { colors, layout } from '@/src/constants';

type MobileViewportProps = {
  children: ReactNode;
};

/**
 * Web preview only: constrains the app to a phone-sized column on wide screens.
 * Native iOS/Android are unaffected.
 */
export function MobileViewport({ children }: MobileViewportProps) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.outer}>
      <View style={styles.frame}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#D0D5DD',
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: layout.mobileWebMaxWidth,
    backgroundColor: colors.background,
    overflow: 'hidden',
    boxShadow: '0 16px 48px rgba(16, 24, 40, 0.14)',
  },
});
