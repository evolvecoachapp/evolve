import { View } from "react-native";
import { HeroSection } from "../../../components/HeroSection";
import { StatCard } from "../../../components/StatCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { NutritionDashboard } from "../models";

export interface NutritionHeaderProps {
  readonly dashboard: NutritionDashboard;
}

export function NutritionHeader({ dashboard }: NutritionHeaderProps) {
  const styles = useThemedStyles(() => ({
    row: { flexDirection: "row" as const, gap: spacing.md },
  }));

  return (
    <HeroSection
      overline="Daily Nutrition Command Center"
      title={dashboard.headline}
      subtitle={dashboard.summary}
      variant="gradient"
    >
      <View style={styles.row}>
        <StatCard
          label="Nutrition Score"
          value={dashboard.nutritionScore}
          unit="%"
          progress={dashboard.nutritionScore}
          icon="sparkles-outline"
          embedded
        />
        <StatCard
          label="Meal Completion"
          value={dashboard.mealSummary.completedMeals}
          unit={`/ ${dashboard.mealSummary.totalMeals}`}
          trend={dashboard.mealSummary.nextMealLabel}
          progress={dashboard.mealSummary.completionPercent}
          icon="restaurant-outline"
          embedded
        />
      </View>
    </HeroSection>
  );
}
