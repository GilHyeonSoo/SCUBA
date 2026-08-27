import { useCallback } from 'react';

import { useScrollChromeStore } from '@/src/stores/scroll-chrome-store';

const MOVE_THRESHOLD = 6;

export function useChromeMapInteraction() {
  const setChromeVisible = useScrollChromeStore((s) => s.setChromeVisible);

  const onMapMove = useCallback(
    (deltaX: number, deltaY: number) => {
      if (Math.abs(deltaX) < MOVE_THRESHOLD && Math.abs(deltaY) < MOVE_THRESHOLD) {
        return;
      }

      if (deltaY > MOVE_THRESHOLD) {
        setChromeVisible(false);
      } else if (deltaY < -MOVE_THRESHOLD) {
        setChromeVisible(true);
      }
    },
    [setChromeVisible],
  );

  const onMapMoveEnd = useCallback(() => {
    // Chrome visibility is updated continuously during pan — same pattern as home scroll.
  }, []);

  return { onMapMove, onMapMoveEnd };
}
