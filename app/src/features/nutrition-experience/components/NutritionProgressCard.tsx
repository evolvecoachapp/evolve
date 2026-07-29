import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { ProgressBar } from "../../../components/ProgressBar";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { MealSummary } from "../models";

export interface NutritionProgressCardProps {
  readonly mealSummary: MealSummary;
}

export function NutritionProgressCard({ mealSummary }: NutritionProgressCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.title3 },
    meta: { ...typography.callout, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="surface">
      <View style={styles.body}>
        <Text style={styles.title}>Meal Adherence</Text>
        <Text style={styles.meta}>
          {mealSummary.completedMeals} of {mealSummary.totalMeals} meals complete
        </Text>
        <ProgressBar progress={mealSummary.completionPercent} />
        <Text style={styles.meta}>{mealSummary.nextMealLabel}</Text>
      </View>
    </AppCard>
  );
}
