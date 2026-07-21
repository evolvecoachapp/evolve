import { StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { spacing } from "../../../theme/theme";
import { useTheme } from "../../../theme/ThemeContext";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WeeklyAnalytics } from "../models/WeeklyAnalytics";
import { AnalyticsChartCard } from "./AnalyticsChartCard";
import { AnalyticsSection } from "./AnalyticsSection";
import { formatAnalyticsVolumeKg } from "./formatAnalyticsDisplay";

const BAR_MAX_HEIGHT = 88;
const BAR_WIDTH = 48;

export interface WeeklyVolumeChartProps {
  /** Pre-computed week-over-week volume from the analytics application layer. */
  weekly?: WeeklyAnalytics | null;
  loading?: boolean;
}

/** Current vs previous week volume — small comparison bars. Presentation only. */
export function WeeklyVolumeChart({
  weekly = null,
  loading = false,
}: WeeklyVolumeChartProps) {
  const { colors } = useTheme();

  const styles = useThemedStyles(({ colors: themeColors, typography }) =>
    StyleSheet.create({
      empty: {
        ...typography.callout,
        color: themeColors.inkMuted,
        textAlign: "center",
        paddingVertical: spacing.lg,
      },
      row: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        gap: spacing.xl,
        paddingTop: spacing.sm,
        minHeight: BAR_MAX_HEIGHT + 48,
      },
      column: {
        alignItems: "center",
        gap: spacing.sm,
        flex: 1,
      },
      barWrap: {
        height: BAR_MAX_HEIGHT,
        width: BAR_WIDTH,
        justifyContent: "flex-end",
        alignItems: "center",
      },
      label: {
        ...typography.caption,
        color: themeColors.inkMuted,
        textAlign: "center",
      },
      value: {
        ...typography.callout,
        color: themeColors.ink,
        fontWeight: "600",
        textAlign: "center",
      },
    }),
  );

  if (!loading && weekly == null) {
    return (
      <AnalyticsSection title="Weekly Volume" testID="weekly-volume-chart">
        <AnalyticsChartCard>
          <Text style={styles.empty}>No weekly volume yet.</Text>
        </AnalyticsChartCard>
      </AnalyticsSection>
    );
  }

  const current = weekly?.currentWeekVolumeKg ?? 0;
  const previous = weekly?.previousWeekVolumeKg ?? 0;
  const maxValue = Math.max(current, previous, 1);
  const currentHeight = (current / maxValue) * BAR_MAX_HEIGHT;
  const previousHeight = (previous / maxValue) * BAR_MAX_HEIGHT;

  return (
    <AnalyticsSection title="Weekly Volume" testID="weekly-volume-chart">
      <AnalyticsChartCard loading={loading}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.value}>
              {formatAnalyticsVolumeKg(previous)}
            </Text>
            <View style={styles.barWrap}>
              <Svg width={BAR_WIDTH} height={BAR_MAX_HEIGHT}>
                <Rect
                  x={0}
                  y={BAR_MAX_HEIGHT - previousHeight}
                  width={BAR_WIDTH}
                  height={Math.max(previousHeight, previous > 0 ? 4 : 0)}
                  rx={6}
                  fill={colors.inkMuted}
                  opacity={0.45}
                />
              </Svg>
            </View>
            <Text style={styles.label}>Previous Week</Text>
          </View>

          <View style={styles.column}>
            <Text style={styles.value}>
              {formatAnalyticsVolumeKg(current)}
            </Text>
            <View style={styles.barWrap}>
              <Svg width={BAR_WIDTH} height={BAR_MAX_HEIGHT}>
                <Rect
                  x={0}
                  y={BAR_MAX_HEIGHT - currentHeight}
                  width={BAR_WIDTH}
                  height={Math.max(currentHeight, current > 0 ? 4 : 0)}
                  rx={6}
                  fill={colors.pulse}
                />
              </Svg>
            </View>
            <Text style={styles.label}>Current Week</Text>
          </View>
        </View>
      </AnalyticsChartCard>
    </AnalyticsSection>
  );
}
