import { Text, View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { MealFood } from "../models";

export interface MealFoodsListProps {
  readonly foods: readonly MealFood[];
}

export function MealFoodsList({ foods }: MealFoodsListProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    list: { gap: spacing.xs },
    row: { flexDirection: "row" as const, justifyContent: "space-between" as const, gap: spacing.md },
    name: { ...typography.callout },
    meta: { ...typography.caption, color: colors.inkMuted },
  }));

  return (
    <View style={styles.list}>
      {foods.map((food) => (
        <View key={food.id} style={styles.row}>
          <Text style={styles.name}>{food.name}</Text>
          <Text style={styles.meta}>{food.quantity} • {food.calories} kcal</Text>
        </View>
      ))}
    </View>
  );
}
