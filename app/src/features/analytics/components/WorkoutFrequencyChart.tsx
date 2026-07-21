import { useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
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
const BAR_GAP = 6;

export interface WorkoutFrequencyChartProps {
  /** Pre-computed workouts-per-week series from the analytics application layer. */
  trend?: WorkoutTrend | null;
  loading?: boolean;
}

/** Workouts per week — simple bar chart. Presentation only. */
export function WorkoutFrequencyChart({
  trend = null,
  loading = false,
}: WorkoutFrequencyChartProps) {
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
  const barWidth =
    points.length > 0
      ? Math.max((plotWidth - BAR_GAP * (points.length - 1)) / points.length, 4)
      : 0;

  const labelIndexes =
    points.length <= 4
      ? points.map((_, index) => index)
      : [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return (
    <AnalyticsSection
      title="Workout Frequency"
      testID="workout-frequency-chart"
    >
      <AnalyticsChartCard loading={loading}>
        {points.length === 0 ? (
          <Text style={styles.empty}>No frequency data yet.</Text>
        ) : (
          <View style={styles.chartWrap} onLayout={onLayout}>
            {width > 0 ? (
              <Svg width={width} height={CHART_HEIGHT}>
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
                {points.map((point, index) => {
                  const barHeight =
                    maxValue === 0
                      ? 0
                      : (point.value / maxValue) * plotHeight;
                  const x = PAD_LEFT + index * (barWidth + BAR_GAP);
                  const y = PAD_TOP + plotHeight - barHeight;
                  return (
                    <Rect
                      key={point.periodStart}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barHeight, point.value > 0 ? 2 : 0)}
                      rx={3}
                      fill={colors.pulse}
                      opacity={0.85}
                    />
                  );
                })}
                {labelIndexes.map((index) => {
                  const point = points[index];
                  if (!point) {
                    return null;
                  }
                  const x =
                    PAD_LEFT + index * (barWidth + BAR_GAP) + barWidth / 2;
                  return (
                    <SvgText
                      key={`label-${point.periodStart}`}
                      x={x}
                      y={CHART_HEIGHT - 8}
                      fill={colors.inkMuted}
                      fontSize={10}
                      textAnchor="middle"
                    >
                      {formatTrendWeekLabel(point.periodStart)}
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
