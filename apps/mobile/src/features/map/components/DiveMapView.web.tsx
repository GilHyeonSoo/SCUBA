import { forwardRef } from 'react';

import type { DiveMapViewProps, DiveMapViewRef } from '@/src/features/map/types';

import { DiveMapViewFallback } from './DiveMapViewFallback';

export const DiveMapView = forwardRef<DiveMapViewRef, DiveMapViewProps>(function DiveMapView(
  props,
  ref,
) {
  return (
    <DiveMapViewFallback
      ref={ref}
      {...props}
      message="웹 미리보기 · iOS/Android Development Build에서 Mapbox 지도 사용"
    />
  );
});

export { DiveMapViewFallback } from './DiveMapViewFallback';
