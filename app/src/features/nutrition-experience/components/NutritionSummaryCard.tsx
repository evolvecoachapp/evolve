import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { ProgressBar } from "../../../components/ProgressBar";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { NutritionDashboard } from "../models";

export interface NutritionSummaryCardProps {
  readonly dashboard: NutritionDashboard;
}

export function NutritionSummaryCard({ dashboard }: NutritionSummaryCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.md },
    title: { ...typography.title3 },
    goal: { ...typography.body, color: colors.inkMuted },
    label: { ...typography.caption, color: colors.inkMuted },
    value: { ...typography.metricCompact },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <View>
          <Text style={styles.title}>Today&apos;s Goal</Text>
          <Text style={styles.goal}>{dashboard.todaysGoal}</Text>
        </View>
        <View>
          <Text style={styles.label}>Daily score</Text>
          <Text style={styles.value}>{dashboard.nutritionScore}%</Text>
          <ProgressBar progress={dashboard.nutritionScore} />
        </View>
      </View>
    </AppCard>
  );
}
