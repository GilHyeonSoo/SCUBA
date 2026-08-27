import * as Location from 'expo-location';

export type DeviceLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export type DeviceLocationResult =
  | { ok: true; location: DeviceLocation }
  | { ok: false; reason: 'services_disabled' | 'permission_denied' | 'unavailable' };

export async function getDeviceLocation(): Promise<DeviceLocationResult> {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    return { ok: false, reason: 'services_disabled' };
  }

  const permission = await Location.getForegroundPermissionsAsync();
  const status =
    permission.status === Location.PermissionStatus.UNDETERMINED
      ? (await Location.requestForegroundPermissionsAsync()).status
      : permission.status;

  if (status !== Location.PermissionStatus.GRANTED) {
    return { ok: false, reason: 'permission_denied' };
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      ok: true,
      location: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? null,
      },
    };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
