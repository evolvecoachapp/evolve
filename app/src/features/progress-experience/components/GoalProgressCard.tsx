import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { ProgressBar } from "../../../components/ProgressBar";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { GoalProgress } from "../models";

export interface GoalProgressCardProps { readonly goal: GoalProgress; readonly onPress?: () => void; }

export function GoalProgressCard({ goal, onPress }: GoalProgressCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({ body: { gap: spacing.md }, title: { ...typography.title3 }, supporting: { ...typography.callout, color: colors.inkMuted }, value: { ...typography.metricCompact } }));
  return (
    <AppCard variant="accent" onPress={onPress} glow>
      <View style={styles.body}>
        <Text style={styles.title}>{goal.title}</Text>
        <Text style={styles.value}>{goal.completionPercent}%</Text>
        <ProgressBar progress={goal.completionPercent} />
        <Text style={styles.supporting}>{goal.currentValue} / {goal.targetValue} {goal.unit} · {goal.status}</Text>
      </View>
    </AppCard>
  );
}
