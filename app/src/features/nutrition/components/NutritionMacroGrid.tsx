import { StyleSheet, View } from "react-native";
import { spacing } from "../../../theme/theme";
import { formatMacroProgress } from "../utils";
import { NutritionMacroCard } from "./NutritionMacroCard";

interface MacroValues {
  current: number;
  target: number;
}

interface NutritionMacroGridProps {
  calories: MacroValues;
  protein: MacroValues;
  carbs: MacroValues;
  fat: MacroValues;
}

export function NutritionMacroGrid({
  calories,
  protein,
  carbs,
  fat,
}: NutritionMacroGridProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <NutritionMacroCard
          kind="calories"
          label="Calories"
          current={calories.current}
          target={calories.target}
          progress={formatMacroProgress(calories.current, calories.target)}
        />
        <NutritionMacroCard
          kind="protein"
          label="Protein"
          current={protein.current}
          target={protein.target}
          progress={formatMacroProgress(protein.current, protein.target)}
        />
      </View>
      <View style={styles.row}>
        <NutritionMacroCard
          kind="carbs"
          label="Carbs"
          current={carbs.current}
          target={carbs.target}
          progress={formatMacroProgress(carbs.current, carbs.target)}
        />
        <NutritionMacroCard
          kind="fat"
          label="Fat"
          current={fat.current}
          target={fat.target}
          progress={formatMacroProgress(fat.current, fat.target)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
