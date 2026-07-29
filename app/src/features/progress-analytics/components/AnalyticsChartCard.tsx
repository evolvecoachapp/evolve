import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { ProgressChart } from "../models";

export interface AnalyticsChartCardProps {
  readonly chart: ProgressChart;
}

export function AnalyticsChartCard({ chart }: AnalyticsChartCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    title: { ...typography.callout },
    meta: { ...typography.caption, color: colors.inkMuted },
    point: { ...typography.body, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="glass">
      <View style={styles.body}>
        <Text style={styles.title}>{chart.title}</Text>
        <Text style={styles.meta}>
          {chart.type} · {chart.unit} · {chart.category} · {chart.points.length} points
        </Text>
        {chart.points.slice(0, 4).map((point) => (
          <Text key={point.label} style={styles.point}>
            {point.label}: {point.value}
          </Text>
        ))}
      </View>
    </AppCard>
  );
}
