export const colors = {
  background: '#FFFFFF',
  surface: '#F7F9FC',
  surfaceElevated: '#FFFFFF',
  primary: '#5383E6',
  primaryStrong: '#005C96',
  primaryMid: '#0090DB',
  primarySoft: '#E6F4FB',
  primaryMuted: '#C5E6F7',
  ocean: '#5383E6',
  oceanLight: '#B3DCF2',
  textPrimary: '#101828',
  textSecondary: '#667085',
  textTertiary: '#98A2B3',
  textOnPrimary: '#FFFFFF',
  border: '#E4E7EC',
  borderLight: '#F2F4F7',
  divider: '#EAECF0',
  success: '#16865C',
  successSoft: '#E8F5EF',
  warning: '#C47A18',
  warningSoft: '#FDF4E7',
  error: '#C93C3C',
  errorSoft: '#FDECEC',
  white: '#FFFFFF',
  tabBar: '#FFFFFF',
  tabBarBorder: '#EAECF0',
  overlay: 'rgba(0, 92, 150, 0.45)',
} as const;

export const gradients = {
  hero: ['#005C96', '#5383E6', '#0090DB'] as const,
  heroSoft: ['#E6F4FB', '#F7F9FC', '#FFFFFF'] as const,
  card: ['#5383E6', '#0090DB'] as const,
};

export type ColorToken = keyof typeof colors;
