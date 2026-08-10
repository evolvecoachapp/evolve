import { StyleSheet, Text } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { RecoveryDashboard } from "../models";

export interface RecoverySummaryCardProps {
  readonly dashboard: RecoveryDashboard;
}

export function RecoverySummaryCard({ dashboard }: RecoverySummaryCardProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      label: { ...typography.caption, color: colors.inkMuted, marginBottom: 4 },
      goal: { ...typography.bodyRelaxed, color: colors.inkSecondary },
    }),
  );

  return (
    <AppCard variant="accent">
      <Text style={styles.label}>Today&apos;s goal</Text>
      <Text style={styles.goal}>{dashboard.todaysGoal}</Text>
    </AppCard>
  );
}
