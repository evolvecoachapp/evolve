import { View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { Meal } from "../models";
import { MealCard } from "./MealCard";

export interface MealTimelineProps {
  readonly meals: readonly Meal[];
  readonly onToggleMeal?: (mealId: string) => void;
}

export function MealTimeline({ meals, onToggleMeal }: MealTimelineProps) {
  const styles = useThemedStyles(() => ({
    list: { gap: spacing.md },
  }));

  return (
    <View style={styles.list}>
      {meals.map((meal) => (
        <MealCard
          key={meal.id}
          meal={meal}
          onPress={onToggleMeal ? () => onToggleMeal(meal.id) : undefined}
        />
      ))}
    </View>
  );
}
