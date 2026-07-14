import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../components/AppCard";
import { AppHeader } from "../components/AppHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionTitle } from "../components/SectionTitle";
import { StatCard } from "../components/StatCard";
import { nutritionMock } from "../data/mocks/nutrition";
import { colors, spacing, typography } from "../theme/theme";

function macroProgress(current: number, target: number) {
  return Math.round((current / target) * 100);
}

export function NutritionScreen() {
  const { calories, protein, carbs, fat, meals } = nutritionMock;

  return (
    <View style={styles.screen}>
      <AppHeader title="Nutrition" subtitle="Today's intake" />
      <ScreenContainer>
        <View style={styles.macroRow}>
          <StatCard
            label="Calories"
            value={calories.current}
            unit={`/ ${calories.target}`}
            icon="flame-outline"
            progress={macroProgress(calories.current, calories.target)}
          />
          <StatCard
            label="Protein"
            value={`${protein.current}g`}
            unit={`/ ${protein.target}g`}
            icon="nutrition-outline"
            progress={macroProgress(protein.current, protein.target)}
          />
        </View>
        <View style={styles.macroRow}>
          <StatCard
            label="Carbs"
            value={`${carbs.current}g`}
            unit={`/ ${carbs.target}g`}
            icon="leaf-outline"
            progress={macroProgress(carbs.current, carbs.target)}
          />
          <StatCard
            label="Fat"
            value={`${fat.current}g`}
            unit={`/ ${fat.target}g`}
            icon="water-outline"
            progress={macroProgress(fat.current, fat.target)}
          />
        </View>

        <View>
          <SectionTitle title="Today's Meals" />
          <View style={styles.mealList}>
            {meals.map((meal) => (
              <AppCard key={meal.name} style={styles.mealCard}>
                <View style={styles.mealRow}>
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealTime}>{meal.time}</Text>
                  </View>
                  <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                </View>
              </AppCard>
            ))}
          </View>
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  macroRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  mealList: {
    gap: spacing.md,
  },
  mealCard: {
    padding: spacing.md,
  },
  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mealInfo: {
    flex: 1,
    gap: 2,
  },
  mealName: {
    ...typography.body,
    fontWeight: "600",
  },
  mealTime: {
    ...typography.caption,
  },
  mealCalories: {
    ...typography.bodySmall,
    fontWeight: "600",
  },
});
