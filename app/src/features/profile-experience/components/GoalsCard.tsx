import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { ProgressBar } from "../../../components/ProgressBar";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { AthleteGoal } from "../models";

export interface GoalsCardProps {
  readonly goals: readonly AthleteGoal[];
}

export function GoalsCard({ goals }: GoalsCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.md },
    title: { ...typography.title3 },
    goalItem: { gap: spacing.xs },
    goalTitle: { ...typography.callout },
    goalDesc: { ...typography.caption, color: colors.inkMuted },
    primary: { ...typography.caption, color: colors.pulse },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Goals</Text>
        {goals.map((goal) => (
          <View key={goal.id} style={styles.goalItem}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              {goal.isPrimary ? <Text style={styles.primary}>Primary</Text> : null}
            </View>
            <Text style={styles.goalDesc}>{goal.description}</Text>
            <ProgressBar progress={goal.progress} />
          </View>
        ))}
      </View>
    </AppCard>
  );
}
