import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { ProgressBar } from "../../../components/ProgressBar";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { Meal } from "../models";
import { MealFoodsList } from "./MealFoodsList";

export interface MealCardProps {
  readonly meal: Meal;
  readonly onPress?: () => void;
}

export function MealCard({ meal, onPress }: MealCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    top: { flexDirection: "row" as const, justifyContent: "space-between" as const, gap: spacing.md },
    title: { ...typography.title3 },
    time: { ...typography.caption, color: colors.inkMuted },
    meta: { ...typography.callout, color: colors.inkMuted },
    status: { ...typography.caption, color: meal.isCompleted ? colors.pulse : colors.inkMuted },
  }));

  return (
    <AppCard variant={meal.isCompleted ? "accent" : "surface"} onPress={onPress}>
      <View style={styles.body}>
        <View style={styles.top}>
          <View>
            <Text style={styles.title}>{meal.title}</Text>
            <Text style={styles.time}>{meal.scheduledTime}</Text>
          </View>
          <Text style={styles.status}>{meal.isCompleted ? "Completed" : "Planned"}</Text>
        </View>
        <Text style={styles.meta}>
          {meal.calories} kcal • {meal.proteinGrams}P • {meal.carbohydratesGrams}C • {meal.fatGrams}F
        </Text>
        <ProgressBar progress={meal.completionPercent} />
        <MealFoodsList foods={meal.foods} />
      </View>
    </AppCard>
  );
}
