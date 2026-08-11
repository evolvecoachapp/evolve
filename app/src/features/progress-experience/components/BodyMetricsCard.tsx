import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { ChartPlaceholder } from "../../../components/ChartPlaceholder";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { BodyMetrics } from "../models";

export interface BodyMetricsCardProps { readonly bodyMetrics: BodyMetrics; readonly onPress?: () => void; }

export function BodyMetricsCard({ bodyMetrics, onPress }: BodyMetricsCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({ body: { gap: spacing.md }, label: { ...typography.caption, color: colors.inkMuted }, value: { ...typography.metricCompact }, supporting: { ...typography.callout, color: colors.inkMuted } }));
  return (
    <AppCard variant="elevated" onPress={onPress}>
      <View style={styles.body}>
        <View>
          <Text style={styles.label}>Body Weight Trend</Text>
          <Text style={styles.value}>{bodyMetrics.bodyWeightKg} kg</Text>
          <Text style={styles.supporting}>Change {bodyMetrics.bodyWeightChangeKg} kg · Body fat {bodyMetrics.bodyFatPercent ?? "--"}%</Text>
        </View>
        <ChartPlaceholder icon="fitness-outline" label="Body weight and body fat views are prepared" />
      </View>
    </AppCard>
  );
}
