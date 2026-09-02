import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, type ReactElement } from 'react';
import {
  Dimensions,
  FlatList,
  PanResponder,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { AppText } from '@/src/components/ui';
import { animation, colors, layout, radius, shadows, spacing } from '@/src/constants';
import {
  exploreSheetEntranceBounce,
  EXPLORE_SHEET_HEIGHT_RATIO,
  exploreSheetEntranceSpring,
  getExploreSheetOffsets,
  getNearestSheetSnap,
} from '@/src/features/explore/constants';
import { MapFilterChips } from '@/src/features/map/components/MapFilterChips';

type MapBottomSheetProps<T> = {
  title: string;
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: ListRenderItem<T>;
  filters: readonly string[];
  selectedFilterIndex: number;
  onFilterChange: (index: number) => void;
  ListEmptyComponent?: ReactElement;
};

/**
 * 지도 화면 공통 바텀시트.
 * 항상 화면 하단(bottom: 0)에 고정하고, 탭바는 z-index로 위에 겹칩니다.
 * bottom 오프셋을 주면 translateY peek 계산과 어긋나 카드 높이가 달라집니다.
 */
export function MapBottomSheet<T>({
  title,
  data,
  keyExtractor,
  renderItem,
  filters,
  selectedFilterIndex,
  onFilterChange,
  ListEmptyComponent,
}: MapBottomSheetProps<T>) {
  const screenHeight = Dimensions.get('window').height;
  const sheetHeight = screenHeight * EXPLORE_SHEET_HEIGHT_RATIO;
  const sheetOffsets = useMemo(
    () => getExploreSheetOffsets(screenHeight),
    [screenHeight],
  );

  const translateY = useSharedValue(sheetOffsets.peek);
  const dragStartY = useRef(sheetOffsets.peek);

  const playEntranceAnimation = useCallback(() => {
    const liftOffset =
      sheetOffsets.peek - screenHeight * exploreSheetEntranceBounce.lift;
    const squashOffset =
      sheetOffsets.peek + screenHeight * exploreSheetEntranceBounce.squash;
    const reboundOffset =
      sheetOffsets.peek - screenHeight * exploreSheetEntranceBounce.rebound;

    translateY.value = sheetOffsets.peek;
    translateY.value = withSequence(
      withSpring(liftOffset, exploreSheetEntranceSpring.lift),
      withSpring(squashOffset, exploreSheetEntranceSpring.drop),
      withSpring(reboundOffset, exploreSheetEntranceSpring.rebound),
      withSpring(sheetOffsets.peek, exploreSheetEntranceSpring.settle),
    );
  }, [screenHeight, sheetOffsets.peek, translateY]);

  useFocusEffect(
    useCallback(() => {
      playEntranceAnimation();
    }, [playEntranceAnimation]),
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
        onPanResponderGrant: () => {
          dragStartY.current = translateY.value;
        },
        onPanResponderMove: (_, gesture) => {
          const next = Math.min(
            sheetOffsets.peek,
            Math.max(sheetOffsets.full, dragStartY.current + gesture.dy),
          );
          translateY.value = next;
        },
        onPanResponderRelease: (_, gesture) => {
          const snapTo = getNearestSheetSnap(
            translateY.value,
            gesture.vy,
            sheetOffsets,
          );
          translateY.value = withSpring(snapTo, animation.spring);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [sheetOffsets, translateY],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.sheet,
        shadows.lg,
        { height: sheetHeight },
        animatedStyle,
      ]}>
      <View {...panResponder.panHandlers} style={styles.dragZone}>
        <View style={styles.handleArea}>
          <View style={styles.handle} />
          <AppText variant="label" style={styles.peekTitle}>
            {title}
          </AppText>
        </View>
      </View>

      <View style={styles.filters}>
        <MapFilterChips
          filters={[...filters]}
          selectedIndex={selectedFilterIndex}
          onSelect={onFilterChange}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        ListEmptyComponent={ListEmptyComponent}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
  dragZone: {
    paddingBottom: spacing.xs,
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  peekTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  filters: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing['3xl'],
  },
});
