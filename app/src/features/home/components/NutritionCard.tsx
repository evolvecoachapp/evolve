import { StyleSheet, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { StatCard } from "../../../components/StatCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { NutritionSummaryCard } from "../models/NutritionSummaryCard";
import { DashboardSection } from "./DashboardSection";

interface NutritionCardProps {
  readonly nutrition: NutritionSummaryCard;
  readonly onSeeAll?: () => void;
  readonly index?: number;
}

function formatMacroValue(
  current: number,
  unitLabel: string,
): string | number {
  return unitLabel ? `${current}${unitLabel}` : current;
}

function formatMacroUnit(target: number, unitLabel: string): string {
  return unitLabel ? `/ ${target}${unitLabel}` : `/ ${target}`;
}

/** Nutrition macros card — presentation only. */
export function NutritionCard({ nutrition, onSeeAll, index }: NutritionCardProps) {
  const styles = useThemedStyles(() =>
    StyleSheet.create({
      macroGrid: {
        flexDirection: "row",
        gap: spacing.md,
      },
    }),
  );

  if (!nutrition.present) {
    return null;
  }

  return (
    <DashboardSection
      title="Nutrition"
      actionLabel="See all"
      onAction={onSeeAll}
      index={index}
    >
      <AppCard variant="elevated">
        <View style={styles.macroGrid}>
          <StatCard
            label="Calories"
            value={formatMacroValue(
              nutrition.calories.current,
              nutrition.calories.unitLabel,
            )}
            unit={formatMacroUnit(
              nutrition.calories.target,
              nutrition.calories.unitLabel,
            )}
            icon="flame-outline"
            progress={nutrition.calories.progressPercent}
          />
          <StatCard
            label="Protein"
            value={formatMacroValue(
              nutrition.protein.current,
              nutrition.protein.unitLabel,
            )}
            unit={formatMacroUnit(
              nutrition.protein.target,
              nutrition.protein.unitLabel,
            )}
            icon="nutrition-outline"
            progress={nutrition.protein.progressPercent}
          />
        </View>
        <View style={[styles.macroGrid, { marginTop: spacing.md }]}>
          <StatCard
            label="Carbs"
            value={formatMacroValue(
              nutrition.carbs.current,
              nutrition.carbs.unitLabel,
            )}
            unit={formatMacroUnit(
              nutrition.carbs.target,
              nutrition.carbs.unitLabel,
            )}
            icon="leaf-outline"
            progress={nutrition.carbs.progressPercent}
          />
          <StatCard
            label="Fat"
            value={formatMacroValue(
              nutrition.fat.current,
              nutrition.fat.unitLabel,
            )}
            unit={formatMacroUnit(
              nutrition.fat.target,
              nutrition.fat.unitLabel,
            )}
            icon="water-outline"
            progress={nutrition.fat.progressPercent}
          />
        </View>
      </AppCard>
    </DashboardSection>
  );
}
