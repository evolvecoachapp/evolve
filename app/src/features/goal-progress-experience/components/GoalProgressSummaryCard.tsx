import { Pressable, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { ProgressBar } from "../../../components/ProgressBar";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { GoalProgressDashboard } from "../models";

export interface GoalProgressSummaryCardProps {
  readonly dashboard: GoalProgressDashboard;
  readonly onUpdateProgress?: () => void;
  readonly onCompleteGoal?: () => void;
}

export function GoalProgressSummaryCard({
  dashboard,
  onUpdateProgress,
  onCompleteGoal,
}: GoalProgressSummaryCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.md },
    title: { ...typography.title3 },
    value: { ...typography.metricCompact },
    supporting: { ...typography.callout, color: colors.inkMuted },
    action: { ...typography.callout, color: colors.pulse },
    actions: { flexDirection: "row", gap: spacing.lg },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.value}>{dashboard.completionPercent}%</Text>
        <ProgressBar progress={dashboard.completionPercent} />
        <Text style={styles.supporting}>
          {dashboard.currentValue} / {dashboard.targetValue} {dashboard.unit}
        </Text>
        <View style={styles.actions}>
          {dashboard.updateAvailable && onUpdateProgress ? (
            <Pressable onPress={onUpdateProgress}>
              <Text style={styles.action}>Update progress</Text>
            </Pressable>
          ) : null}
          {dashboard.completeAvailable && onCompleteGoal ? (
            <Pressable onPress={onCompleteGoal}>
              <Text style={styles.action}>Complete goal</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </AppCard>
  );
}
