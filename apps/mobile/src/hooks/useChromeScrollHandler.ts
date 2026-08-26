import { useCallback } from 'react';
import {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import { useScrollChromeStore } from '@/src/stores/scroll-chrome-store';

const SCROLL_THRESHOLD = 6;
const TOP_THRESHOLD = 12;

export function useChromeScrollHandler() {
  const setChromeVisible = useScrollChromeStore((s) => s.setChromeVisible);
  const lastY = useSharedValue(0);

  const updateChrome = useCallback(
    (visible: boolean) => {
      setChromeVisible(visible);
    },
    [setChromeVisible],
  );

  return useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      const diff = y - lastY.value;

      if (y <= TOP_THRESHOLD) {
        runOnJS(updateChrome)(true);
      } else if (diff > SCROLL_THRESHOLD) {
        runOnJS(updateChrome)(false);
      } else if (diff < -SCROLL_THRESHOLD) {
        runOnJS(updateChrome)(true);
      }

      lastY.value = y;
    },
  });
}
