import { StyleSheet, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { GradientBackground } from "../components/GradientBackground";
import { TabScreenContainer } from "../components/TabScreenContainer";
import { SectionTitle } from "../components/SectionTitle";
import { nutritionMock } from "../data/mocks/nutrition";
import {
  NutritionHero,
  NutritionMacroGrid,
  NutritionMealCard,
} from "../features/nutrition/components";
import { formatMacroProgress } from "../features/nutrition/utils";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

export function NutritionScreen() {
  const { calories, protein, carbs, fat, meals } = nutritionMock;
  const calorieProgress = formatMacroProgress(calories.current, calories.target);

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
                  key={meal.name}
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
