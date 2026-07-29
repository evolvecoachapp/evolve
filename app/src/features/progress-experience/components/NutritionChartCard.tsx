import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { ChartPlaceholder } from "../../../components/ChartPlaceholder";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { NutritionProgress } from "../models";

export interface NutritionChartCardProps { readonly progress: NutritionProgress; readonly onPress?: () => void; }

export function NutritionChartCard({ progress, onPress }: NutritionChartCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({ body: { gap: spacing.md }, label: { ...typography.caption, color: colors.inkMuted }, value: { ...typography.metricCompact }, supporting: { ...typography.callout, color: colors.inkMuted } }));
  return (
    <AppCard variant="elevated" onPress={onPress}>
      <View style={styles.body}>
        <View>
          <Text style={styles.label}>Nutrition Adherence</Text>
          <Text style={styles.value}>{progress.proteinAdherencePercent}%</Text>
          <Text style={styles.supporting}>Calories {progress.caloriesAdherencePercent}% ? Protein {progress.averageProteinGrams}g avg</Text>
        </View>
        <ChartPlaceholder icon="nutrition-outline" label="Reusable nutrition visualization prepared" />
      </View>
    </AppCard>
  );
}
