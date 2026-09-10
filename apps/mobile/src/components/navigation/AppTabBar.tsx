import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBarGlassShell } from '@/src/components/navigation/TabBarGlassBackground';
import { animation, colors, floatingTabBar, shadows, spacing } from '@/src/constants';

type TabIconName = keyof typeof Ionicons.glyphMap;

type TabConfig = {
  label: string;
  icon: TabIconName;
  activeIcon: TabIconName;
};

type TabLayout = {
  x: number;
  width: number;
};

const TAB_CONFIG: Record<string, TabConfig> = {
  index: { label: '홈', icon: 'home-outline', activeIcon: 'home' },
  explore: { label: '탐색', icon: 'compass-outline', activeIcon: 'compass' },
  dive: { label: '다이빙', icon: 'water-outline', activeIcon: 'water' },
  tour: { label: '모임', icon: 'people-outline', activeIcon: 'people' },
  my: { label: '마이', icon: 'person-outline', activeIcon: 'person' },
};

function TabItem({
  label,
  icon,
  activeIcon,
  isFocused,
  onPress,
  onLongPress,
  onLayout,
}: TabConfig & {
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onLayout={onLayout}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}>
      <View style={styles.tabIndicator}>
        <Ionicons
          name={isFocused ? activeIcon : icon}
          size={22}
          color={isFocused ? colors.primaryStrong : colors.textPrimary}
        />
        <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
      </View>
    </Pressable>
  );
}

type TabRoute = { key: string; name: string; params?: object };

type AppTabBarProps = {
  state: { index: number; routes: TabRoute[] };
  descriptors: Record<string, { options: { title?: string } }>;
  navigation: {
    emit: (event: {
      type: string;
      target: string;
      canPreventDefault?: boolean;
    }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: object) => void;
  };
};

export function AppTabBar({ state, descriptors, navigation }: AppTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, spacing.sm) + floatingTabBar.bottomGap;
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});
  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(0);

  const visibleRoutes = useMemo(
    () => state.routes.filter((route) => TAB_CONFIG[route.name] != null),
    [state.routes],
  );
  const focusedRouteName = state.routes[state.index]?.name ?? visibleRoutes[0]?.name;

  const movePill = useCallback(
    (layout: TabLayout) => {
      pillX.value = withSpring(layout.x, animation.spring);
      pillWidth.value = withSpring(layout.width, animation.spring);
    },
    [pillWidth, pillX],
  );

  useEffect(() => {
    const layout = tabLayouts[focusedRouteName];
    if (layout) {
      movePill(layout);
    }
  }, [focusedRouteName, movePill, tabLayouts]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillWidth.value,
    opacity: pillWidth.value > 0 ? 1 : 0,
  }));

  const handleTabLayout = useCallback(
    (routeName: string) => (event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      setTabLayouts((previous) => ({ ...previous, [routeName]: { x, width } }));

      if (routeName === focusedRouteName) {
        movePill({ x, width });
      }
    },
    [focusedRouteName, movePill],
  );

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: bottomOffset, paddingHorizontal: floatingTabBar.horizontalInset }]}>
      <TabBarGlassShell style={[styles.glassShell, shadows.lg]}>
        <View style={styles.tabTrack}>
          <Animated.View pointerEvents="none" style={[styles.selectionPill, pillStyle]} />
          {visibleRoutes.map((route) => {
            const config = TAB_CONFIG[route.name];
            if (!config) {
              return null;
            }

            const isFocused = focusedRouteName === route.name;
            const { options } = descriptors[route.key];

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TabItem
                key={route.key}
                {...config}
                label={options.title ?? config.label}
                isFocused={isFocused}
                onLayout={handleTabLayout(route.name)}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </View>
      </TabBarGlassShell>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 50,
    elevation: 50,
  },
  glassShell: {
    height: floatingTabBar.barHeight,
  },
  tabTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: spacing.xs,
  },
  selectionPill: {
    position: 'absolute',
    top: spacing.xs,
    bottom: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: colors.primaryStrong,
    fontWeight: '700',
  },
});
