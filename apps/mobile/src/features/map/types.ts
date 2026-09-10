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

export type MapCameraPadding = {
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
};

export type MapCameraTarget = {
  latitude: number;
  longitude: number;
  zoomLevel?: number;
  padding?: MapCameraPadding;
};

export type MapViewport = {
  centerLatitude: number;
  centerLongitude: number;
  zoomLevel: number;
  bounds?: MapBounds;
};

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type DiveMapViewRef = {
  flyTo: (target: MapCameraTarget, duration?: number) => void;
  setCameraPadding: (padding: MapCameraPadding) => void;
};

export type DiveMapViewProps = {
  markers?: MapMarker[];
  selectedMarkerId?: string | null;
  onMarkerPress?: (markerId: string) => void;
  onMapPress?: () => void;
  onMapMove?: (deltaX: number, deltaY: number) => void;
  onMapMoveEnd?: () => void;
  onViewportChange?: (viewport: MapViewport) => void;
  bottomInset?: number;
  initialCenter?: MapCameraTarget;
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
};
