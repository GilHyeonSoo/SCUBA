import { TextStyle } from 'react-native';

import { colors } from './colors';

export const typography = {
  numericHero: {
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 48,
    color: colors.textPrimary,
  },
  numeric: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    color: colors.textPrimary,
  },
  display: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.8,
    color: colors.textPrimary,
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.textTertiary,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
