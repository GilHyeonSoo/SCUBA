import { Platform, ViewStyle } from 'react-native';

import { colors } from './colors';

type ShadowPreset = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation' | 'boxShadow'
>;

const shadowRgb = '0, 119, 191';

export const shadows = {
  sm: Platform.select<ShadowPreset>({
    ios: {
      shadowColor: colors.primaryStrong,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    web: { boxShadow: `0 2px 8px rgba(${shadowRgb}, 0.06)` },
    default: {},
  }),
  md: Platform.select<ShadowPreset>({
    ios: {
      shadowColor: colors.primaryStrong,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
    },
    android: { elevation: 6 },
    web: { boxShadow: `0 8px 24px rgba(${shadowRgb}, 0.1)` },
    default: {},
  }),
  lg: Platform.select<ShadowPreset>({
    ios: {
      shadowColor: colors.primaryStrong,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.14,
      shadowRadius: 32,
    },
    android: { elevation: 10 },
    web: { boxShadow: `0 16px 40px rgba(${shadowRgb}, 0.14)` },
    default: {},
  }),
} as const;
