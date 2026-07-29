import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { GoalProgress } from "../models";

export interface GoalProgressCardProps {
  readonly goals: readonly GoalProgress[];
}

export function GoalProgressCard({ goals }: GoalProgressCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.callout },
    goalTitle: { ...typography.body },
    meta: { ...typography.caption, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Goal Progress</Text>
        {goals.map((goal) => (
          <View key={goal.id}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.meta}>
              {goal.currentValue}/{goal.targetValue} {goal.unit} · {goal.completionPercent}%
            </Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
}
