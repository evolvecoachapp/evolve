import { StyleSheet, View, type ViewStyle } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { SkeletonBlock } from "../../../components/Skeleton";
import { radius, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

export interface AnalyticsChartCardProps {
  children: React.ReactNode;
  /** When true, shows a chart-height skeleton instead of children. */
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

/** Premium elevated card shell for analytics charts. */
export function AnalyticsChartCard({
  children,
  loading = false,
  style,
  testID,
}: AnalyticsChartCardProps) {
  const styles = useThemedStyles(() =>
    StyleSheet.create({
      skeleton: {
        height: spacing.chart.md,
        width: "100%",
      },
    }),
  );

  return (
    <View testID={testID}>
      <AppCard variant="elevated" style={style}>
        {loading ? (
          <View testID="analytics-chart-skeleton">
            <SkeletonBlock
              width="100%"
              height={spacing.chart.md}
              borderRadius={radius.md}
              style={styles.skeleton}
            />
          </View>
        ) : (
          children
        )}
      </AppCard>
    </View>
  );
}
