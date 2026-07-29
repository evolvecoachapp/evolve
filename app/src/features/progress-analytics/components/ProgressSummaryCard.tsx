import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { ProgressSummary } from "../models";

export interface ProgressSummaryCardProps {
  readonly summary: ProgressSummary;
}

export function ProgressSummaryCard({ summary }: ProgressSummaryCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    title: { ...typography.callout },
    row: { ...typography.body, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="glass">
      <View style={styles.body}>
        <Text style={styles.title}>Progress Summary</Text>
        <Text style={styles.row}>Strength change: {summary.strengthChangePercent}%</Text>
        <Text style={styles.row}>Body weight change: {summary.bodyWeightChangeKg} kg</Text>
        <Text style={styles.row}>Recovery score: {summary.recoveryScore}</Text>
        <Text style={styles.row}>Consistency: {summary.consistencyPercent}%</Text>
      </View>
    </AppCard>
  );
}
