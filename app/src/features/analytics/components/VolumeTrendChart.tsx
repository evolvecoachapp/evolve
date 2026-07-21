import { useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import { spacing } from "../../../theme/theme";
import { useTheme } from "../../../theme/ThemeContext";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutTrend } from "../models/WorkoutTrend";
import { AnalyticsChartCard } from "./AnalyticsChartCard";
import { AnalyticsSection } from "./AnalyticsSection";
import {
  formatChartAxisValue,
  formatTrendWeekLabel,
} from "./formatChartDisplay";

const CHART_HEIGHT = spacing.chart.md;
const PAD_LEFT = 36;
const PAD_RIGHT = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;

export interface VolumeTrendChartProps {
  /** Pre-computed weekly volume trend from the analytics application layer. */
  trend?: WorkoutTrend | null;
  loading?: boolean;
}

/** Weekly training volume — simple line chart. Presentation only. */
export function VolumeTrendChart({
  trend = null,
  loading = false,
}: VolumeTrendChartProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  const styles = useThemedStyles(({ colors: themeColors, typography }) =>
    StyleSheet.create({
      empty: {
        ...typography.callout,
        color: themeColors.inkMuted,
        textAlign: "center",
        paddingVertical: spacing.lg,
      },
      chartWrap: {
        height: CHART_HEIGHT,
        width: "100%",
      },
    }),
  );

  const points = trend?.points ?? [];
  const values = points.map((point) => point.value);
  const maxValue = values.length > 0 ? Math.max(...values, 1) : 1;

  function onLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  const plotWidth = Math.max(width - PAD_LEFT - PAD_RIGHT, 0);
  const plotHeight = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const plotted =
    width > 0 && points.length > 0
      ? points.map((point, index) => {
          const x =
            points.length === 1
              ? PAD_LEFT + plotWidth / 2
              : PAD_LEFT + (index / (points.length - 1)) * plotWidth;
          const y =
            PAD_TOP + plotHeight * (1 - point.value / maxValue);
          return { x, y, point };
        })
      : [];

  const polylinePoints = plotted.map((p) => `${p.x},${p.y}`).join(" ");

  const labelIndexes =
    points.length <= 4
      ? points.map((_, index) => index)
      : [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return (
    <AnalyticsSection title="Volume Trend" testID="volume-trend-chart">
      <AnalyticsChartCard loading={loading}>
        {points.length === 0 ? (
          <Text style={styles.empty}>No volume data yet.</Text>
        ) : (
          <View style={styles.chartWrap} onLayout={onLayout}>
            {width > 0 ? (
              <Svg width={width} height={CHART_HEIGHT}>
                <Line
                  x1={PAD_LEFT}
                  y1={PAD_TOP}
                  x2={PAD_LEFT}
                  y2={PAD_TOP + plotHeight}
                  stroke={colors.border}
                  strokeWidth={1}
                />
                <Line
                  x1={PAD_LEFT}
                  y1={PAD_TOP + plotHeight}
                  x2={PAD_LEFT + plotWidth}
                  y2={PAD_TOP + plotHeight}
                  stroke={colors.border}
                  strokeWidth={1}
                />
                <SvgText
                  x={4}
                  y={PAD_TOP + 4}
                  fill={colors.inkMuted}
                  fontSize={10}
                >
                  {formatChartAxisValue(maxValue)}
                </SvgText>
                <SvgText
                  x={4}
                  y={PAD_TOP + plotHeight}
                  fill={colors.inkMuted}
                  fontSize={10}
                >
                  0
                </SvgText>
                {polylinePoints.length > 0 ? (
                  <Polyline
                    points={polylinePoints}
                    fill="none"
                    stroke={colors.pulse}
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ) : null}
                {plotted.map((item) => (
                  <Circle
                    key={item.point.periodStart}
                    cx={item.x}
                    cy={item.y}
                    r={3.5}
                    fill={colors.pulse}
                  />
                ))}
                {labelIndexes.map((index) => {
                  const item = plotted[index];
                  if (!item) {
                    return null;
                  }
                  return (
                    <SvgText
                      key={`label-${item.point.periodStart}`}
                      x={item.x}
                      y={CHART_HEIGHT - 8}
                      fill={colors.inkMuted}
                      fontSize={10}
                      textAnchor="middle"
                    >
                      {formatTrendWeekLabel(item.point.periodStart)}
                    </SvgText>
                  );
                })}
              </Svg>
            ) : null}
          </View>
        )}
      </AnalyticsChartCard>
    </AnalyticsSection>
  );
}
