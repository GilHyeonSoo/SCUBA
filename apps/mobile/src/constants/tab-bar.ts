import { Platform } from 'react-native';

const TAB_BAR_ESTIMATE = Platform.OS === 'ios' ? 88 : 72;

export function getTabBarChromeHeight(bottomSafeArea: number): number {
  return TAB_BAR_ESTIMATE + bottomSafeArea;
}
