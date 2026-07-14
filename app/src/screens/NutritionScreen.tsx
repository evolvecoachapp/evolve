import { StyleSheet, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { GradientBackground } from "../components/GradientBackground";
import { TabScreenContainer } from "../components/TabScreenContainer";
import { SectionTitle } from "../components/SectionTitle";
import {
  NutritionHero,
  NutritionMacroGrid,
  NutritionMealCard,
} from "../features/nutrition/components";
import { useNutrition } from "../features/nutrition/hooks";
import { formatMacroProgress } from "../features/nutrition/utils";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

export function NutritionScreen() {
  const { nutrition, loading } = useNutrition();

  const styles = useThemedStyles(() =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: "transparent",
      },
      mealList: {
        gap: spacing.md,
      },
    }),
  );

  if (loading || !nutrition) {
    return null;
  }

  const { calories, protein, carbs, fat, meals } = nutrition.daily;
  const calorieProgress = formatMacroProgress(calories.current, calories.target);

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <AppHeader title="Nutrition" subtitle="Today's intake" />
        <TabScreenContainer gradient={false}>
          <NutritionHero
            caloriesCurrent={calories.current}
            caloriesTarget={calories.target}
            completionPercent={calorieProgress}
          />

          <View>
            <SectionTitle title="Macros" />
            <NutritionMacroGrid
              calories={calories}
              protein={protein}
              carbs={carbs}
              fat={fat}
            />
          </View>

          <View>
            <SectionTitle title="Today's Meals" />
            <View style={styles.mealList}>
              {meals.map((meal) => (
                <NutritionMealCard
                  key={meal.id}
                  name={meal.name}
                  time={meal.time}
                  calories={meal.calories}
                />
              ))}
            </View>
          </View>
        </TabScreenContainer>
      </View>
    </GradientBackground>
  );
}
