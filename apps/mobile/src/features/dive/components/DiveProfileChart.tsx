import { type ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import type { DiveProfileSample } from '@/src/features/dive-log/types';
import { canRenderProfile, downsampleProfile } from '@/src/features/dive/utils/dive-ledger';

const INLINE_CHART_HEIGHT = 72;
const FEATURED_CHART_HEIGHT = 96;
const TARGET_SAMPLES = 48;
const LINE_THICKNESS = 2;
const AXIS_LABEL_WIDTH = 36;

type DiveProfileChartProps = {
  profile: DiveProfileSample[];
  variant?: 'inline' | 'featured';
};

type ChartPoint = {
  x: number;
  y: number;
};

function buildChartPoints(
  samples: DiveProfileSample[],
  width: number,
  height: number,
  maxDepthM: number,
): ChartPoint[] {
  if (samples.length === 0) {
    return [];
  }

  const horizontalPadding = spacing.xs;
  const chartWidth = Math.max(width - horizontalPadding * 2, 1);
  const chartHeight = Math.max(height, 1);

  return samples.map((sample, index) => {
    const ratio = samples.length > 1 ? index / (samples.length - 1) : 0;

    return {
      x: horizontalPadding + ratio * chartWidth,
      y: (sample.depthM / maxDepthM) * chartHeight,
    };
  });
}

function ProfileLineSegments({ points }: { points: ChartPoint[] }) {
  const segments: ReactNode[] = [];

  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (length < 0.5) {
      continue;
    }

    const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;

    segments.push(
      <View
        key={`segment-${index}`}
        style={[
          styles.lineSegment,
          {
            width: length,
            left: centerX - length / 2,
            top: centerY - LINE_THICKNESS / 2,
            transform: [{ rotate: `${angle}deg` }],
          },
        ]}
      />,
    );
  }

  return <>{segments}</>;
}

export function DiveProfileChart({ profile, variant = 'inline' }: DiveProfileChartProps) {
  const [featuredPlotWidth, setFeaturedPlotWidth] = useState(0);

  if (!canRenderProfile(profile)) {
    return null;
  }

  const isFeatured = variant === 'featured';
  const chartHeight = isFeatured ? FEATURED_CHART_HEIGHT : INLINE_CHART_HEIGHT;
  const samples = downsampleProfile(profile, TARGET_SAMPLES);
  const maxDepthM = Math.max(...samples.map((sample) => sample.depthM), 0.1);
  const points = buildChartPoints(samples, featuredPlotWidth, chartHeight, maxDepthM);

  if (isFeatured) {
    const depthLabel = `${Math.round(maxDepthM)}m`;

    return (
      <View style={styles.featuredContainer} accessibilityLabel="다이빙 수심 프로파일">
        <View style={[styles.featuredChartArea, { height: chartHeight }]}>
          <AppText variant="caption" style={styles.axisLabelTop}>
            0m
          </AppText>
          <AppText variant="caption" style={styles.axisLabelBottom}>
            {depthLabel}
          </AppText>
          <View style={styles.axisLineTop} />
          <View style={styles.axisLineBottom} />
          <View
            onLayout={(event) => setFeaturedPlotWidth(event.nativeEvent.layout.width)}
            style={[styles.plotArea, { height: chartHeight }]}>
            <ProfileLineSegments points={points} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inlineContainer} accessibilityLabel="다이빙 수심 프로파일">
      <View style={styles.inlineSurfaceLine} />
      <View style={styles.inlineBarsRow}>
        {samples.map((sample, index) => {
          const barHeight = Math.max(2, (sample.depthM / maxDepthM) * INLINE_CHART_HEIGHT);

          return (
            <View
              key={`${sample.elapsedSec}-${index}`}
              style={[
                styles.inlineBar,
                {
                  height: barHeight,
                  opacity: 0.35 + (sample.depthM / maxDepthM) * 0.55,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  featuredContainer: {
    marginTop: spacing.sm,
  },
  featuredChartArea: {
    position: 'relative',
    justifyContent: 'center',
  },
  axisLabelTop: {
    position: 'absolute',
    left: 0,
    top: 0,
    color: colors.textTertiary,
    fontSize: 13,
    lineHeight: 18,
  },
  axisLabelBottom: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    color: colors.textTertiary,
    fontSize: 13,
    lineHeight: 18,
  },
  axisLineTop: {
    position: 'absolute',
    left: AXIS_LABEL_WIDTH,
    right: 0,
    top: 8,
    height: 1,
    backgroundColor: colors.divider,
  },
  axisLineBottom: {
    position: 'absolute',
    left: AXIS_LABEL_WIDTH,
    right: 0,
    bottom: 8,
    height: 1,
    backgroundColor: colors.divider,
  },
  plotArea: {
    marginLeft: AXIS_LABEL_WIDTH,
    position: 'relative',
  },
  lineSegment: {
    position: 'absolute',
    height: LINE_THICKNESS,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },
  inlineContainer: {
    height: INLINE_CHART_HEIGHT + 8,
    justifyContent: 'flex-end',
  },
  inlineSurfaceLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.divider,
  },
  inlineBarsRow: {
    height: INLINE_CHART_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  inlineBar: {
    flex: 1,
    backgroundColor: colors.primary,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
  },
});
