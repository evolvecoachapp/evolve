import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { AnalyticsFilter } from "../models";

export interface AnalyticsFilterCardProps {
  readonly filter: AnalyticsFilter;
}

export function AnalyticsFilterCard({ filter }: AnalyticsFilterCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    title: { ...typography.callout },
    row: { ...typography.body, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="glass">
      <View style={styles.body}>
        <Text style={styles.title}>Analytics Filter</Text>
        <Text style={styles.row}>Period: {filter.period.label} ({filter.period.kind})</Text>
        <Text style={styles.row}>Categories: {filter.categories.join(", ")}</Text>
        <Text style={styles.row}>Charts: {filter.includeCharts ? "included" : "hidden"}</Text>
      </View>
    </AppCard>
  );
}
