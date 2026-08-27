import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  type DeviceLocation,
  getDeviceLocation,
} from '@/src/features/map/services/device-location';

export type DeviceLocationStatus =
  | 'idle'
  | 'loading'
  | 'granted'
  | 'permission_denied'
  | 'services_disabled'
  | 'unavailable';

type UseDeviceLocationOptions = {
  /** 화면 포커스 시 위치를 다시 조회합니다. */
  refreshOnFocus?: boolean;
};

export function useDeviceLocation(options: UseDeviceLocationOptions = {}) {
  const { refreshOnFocus = true } = options;
  const [location, setLocation] = useState<DeviceLocation | null>(null);
  const [status, setStatus] = useState<DeviceLocationStatus>('idle');

  const refresh = useCallback(async () => {
    setStatus('loading');

    const result = await getDeviceLocation();
    if (result.ok) {
      setLocation(result.location);
      setStatus('granted');
      return result.location;
    }

    setLocation(null);
    setStatus(result.reason);
    return null;
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (refreshOnFocus) {
        void refresh();
      }
    }, [refresh, refreshOnFocus]),
  );

  return {
    location,
    status,
    isLoading: status === 'loading' || status === 'idle',
    refresh,
  };
}
