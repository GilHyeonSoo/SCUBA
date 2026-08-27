export type MapMarkerTone = 'buddy' | 'pool' | 'site' | 'shop' | 'tour';

export type MapMarkerVariant = 'place' | 'profile';

export type MapMarker = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  tone: MapMarkerTone;
  variant?: MapMarkerVariant;
  profileImageUrl?: string | null;
  isCurrentUser?: boolean;
};

export type MapCameraTarget = {
  latitude: number;
  longitude: number;
  zoomLevel?: number;
};

export type DiveMapViewRef = {
  flyTo: (target: MapCameraTarget, duration?: number) => void;
};

export type DiveMapViewProps = {
  markers?: MapMarker[];
  onMapMove?: (deltaX: number, deltaY: number) => void;
  onMapMoveEnd?: () => void;
  bottomInset?: number;
  initialCenter?: MapCameraTarget;
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
};
