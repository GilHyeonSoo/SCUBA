import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { animation, colors, radius, shadows, spacing } from '@/src/constants';
import { useScrollChromeStore } from '@/src/stores/scroll-chrome-store';

type TabIconName = keyof typeof Ionicons.glyphMap;

type TabConfig = {
  label: string;
  icon: TabIconName;
  activeIcon: TabIconName;
  isCenter?: boolean;
};

const TAB_CONFIG: Record<string, TabConfig> = {
  explore: { label: '탐색', icon: 'compass-outline', activeIcon: 'compass' },
  dive: { label: '다이빙', icon: 'water-outline', activeIcon: 'water' },
  index: { label: '홈', icon: 'home', activeIcon: 'home', isCenter: true },
  tour: { label: '모임', icon: 'people-outline', activeIcon: 'people' },
  my: { label: '마이', icon: 'person-outline', activeIcon: 'person' },
};

function TabItem({
  label,
  icon,
  activeIcon,
  isFocused,
  isCenter,
  onPress,
  onLongPress,
}: TabConfig & {
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (isCenter) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={() => {
          scale.value = withSpring(0.92, animation.spring);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, animation.spring);
        }}
        style={styles.centerTabWrap}>
        <Animated.View style={[styles.centerButton, animatedStyle, shadows.lg]}>
          <Ionicons name={isFocused ? activeIcon : icon} size={26} color={colors.white} />
        </Animated.View>
        <Animated.Text style={[styles.centerLabel, isFocused && styles.centerLabelActive]}>
          {label}
        </Animated.Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        scale.value = withSpring(0.9, animation.spring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, animation.spring);
      }}
      style={styles.tabItem}>
      <Animated.View style={[styles.iconWrap, animatedStyle]}>
        <Ionicons
          name={isFocused ? activeIcon : icon}
          size={22}
          color={isFocused ? colors.primary : colors.textTertiary}
        />
        {isFocused ? <View style={styles.activeDot} /> : null}
      </Animated.View>
      <Animated.Text style={[styles.label, isFocused && styles.labelActive]}>
        {label}
      </Animated.Text>
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
  const chromeVisible = useScrollChromeStore((s) => s.chromeVisible);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const activeRouteName = state.routes[state.index]?.name;
  const highlightRouteName = activeRouteName === 'buddy' ? 'index' : activeRouteName;
  const showTabBar =
    chromeVisible || activeRouteName === 'buddy' || activeRouteName === 'explore';

  useEffect(() => {
    translateY.value = withTiming(showTabBar ? 0 : 120, {
      duration: animation.normal,
    });
    opacity.value = withTiming(showTabBar ? 1 : 0, {
      duration: animation.fast,
    });
  }, [showTabBar, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const bottomPadding = Platform.select({
    web: spacing.sm,
    ios: Math.max(insets.bottom, spacing.sm),
    android: Math.max(insets.bottom, spacing.sm),
    default: spacing.sm,
  });

  return (
    <Animated.View
      style={[styles.wrapper, animatedStyle]}
      pointerEvents={showTabBar ? 'auto' : 'none'}>
      <View style={[styles.container, shadows.md, { paddingBottom: bottomPadding }]}>
        <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const config = TAB_CONFIG[route.name];
          if (!config) return null;

          const isFocused = highlightRouteName === route.name;
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
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    elevation: 50,
  },
  container: {
    backgroundColor: colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: colors.tabBarBorder,
    paddingTop: spacing.sm,
    width: '100%',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textTertiary,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  centerTabWrap: {
    flex: 1,
    alignItems: 'center',
    marginTop: -22,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.white,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  centerLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
