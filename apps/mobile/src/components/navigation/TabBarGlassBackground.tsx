import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius } from '@/src/constants';

type TabBarGlassShellProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function TabBarGlassShell({ children, style }: TabBarGlassShellProps) {
  const shellStyle = [styles.shell, style];
  const borderOverlay = (
    <View pointerEvents="none" style={[styles.border, StyleSheet.absoluteFill]} />
  );

  if (Platform.OS === 'ios' && isGlassEffectAPIAvailable()) {
    return (
      <GlassView
        colorScheme="light"
        glassEffectStyle="clear"
        isInteractive
        style={shellStyle}
        tintColor="rgba(255, 255, 255, 0.52)">
        {borderOverlay}
        {children}
      </GlassView>
    );
  }

  if (Platform.OS !== 'web') {
    return (
      <View style={[shellStyle, styles.fallbackShell]}>
        <BlurView
          blurMethod="dimezisBlurView"
          intensity={88}
          style={StyleSheet.absoluteFill}
          tint="light"
        />
        <View pointerEvents="none" style={[styles.fallbackTint, StyleSheet.absoluteFill]} />
        {borderOverlay}
        {children}
      </View>
    );
  }

  return (
    <View style={[shellStyle, styles.fallbackShell]}>
      <View pointerEvents="none" style={[styles.webBase, StyleSheet.absoluteFill]} />
      {borderOverlay}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radius.xl + 8,
  },
  fallbackShell: {
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
  },
  fallbackTint: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  webBase: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
  },
  border: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: radius.xl + 8,
  },
});
