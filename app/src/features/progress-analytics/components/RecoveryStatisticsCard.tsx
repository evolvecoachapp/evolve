import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { RecoveryStatistics } from "../models";

export interface RecoveryStatisticsCardProps {
  readonly statistics: RecoveryStatistics;
}

export function RecoveryStatisticsCard({ statistics }: RecoveryStatisticsCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    title: { ...typography.callout },
    row: { ...typography.body, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Recovery Statistics</Text>
        <Text style={styles.row}>Score: {statistics.averageScore}</Text>
        <Text style={styles.row}>Trend: {statistics.trend}</Text>
        <Text style={styles.row}>Readiness: {statistics.readinessLabel}</Text>
      </View>
    </AppCard>
  );
}
