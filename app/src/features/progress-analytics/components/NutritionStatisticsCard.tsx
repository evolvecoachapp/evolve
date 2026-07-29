import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { NutritionStatistics } from "../models";

export interface NutritionStatisticsCardProps {
  readonly statistics: NutritionStatistics;
}

export function NutritionStatisticsCard({ statistics }: NutritionStatisticsCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    title: { ...typography.callout },
    row: { ...typography.body, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Nutrition Statistics</Text>
        <Text style={styles.row}>Avg calories: {statistics.averageCalories}</Text>
        <Text style={styles.row}>Avg protein: {statistics.averageProteinGrams} g</Text>
        <Text style={styles.row}>Calorie adherence: {statistics.calorieAdherencePercent}%</Text>
        <Text style={styles.row}>Protein adherence: {statistics.proteinAdherencePercent}%</Text>
      </View>
    </AppCard>
  );
}
