import { spacing } from './spacing';

export const floatingTabBar = {
  barHeight: 64,
  bottomGap: 4,
  horizontalInset: 16,
} as const;

export function getTabBarChromeHeight(bottomSafeArea: number): number {
  return (
    floatingTabBar.barHeight +
    floatingTabBar.bottomGap +
    Math.max(bottomSafeArea, spacing.sm)
  );
}
