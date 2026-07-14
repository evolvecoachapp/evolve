import { StyleSheet, Text, View } from "react-native";
import { HeroEntrance } from "../../../animation/HeroEntrance";
import { FloatingStatChip } from "../../../components/FloatingStatChip";
import { HeroAmbientLayer } from "../../../components/HeroAmbientLayer";
import { ProgressBar } from "../../../components/ProgressBar";
import { heroLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import {
  formatCalorieLabel,
  formatCompletionPercent,
  formatNutritionDate,
  formatRemainingCalories,
} from "../utils";

interface NutritionHeroProps {
  caloriesCurrent: number;
  caloriesTarget: number;
  completionPercent: number;
}

export function NutritionHero({
  caloriesCurrent,
  caloriesTarget,
  completionPercent,
}: NutritionHeroProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      hero: {
        marginHorizontal: -spacing.screenPadding,
        marginBottom: spacing.md,
        borderBottomLeftRadius: heroLayout.heroRadius,
        borderBottomRightRadius: heroLayout.heroRadius,
        minHeight: heroLayout.minHeight + spacing["2xl"],
      },
      content: {
        paddingHorizontal: spacing.screenPadding,
        gap: heroLayout.contentGap,
      },
      headlineBlock: {
        gap: heroLayout.headlineGap,
        paddingTop: spacing.sm,
        maxWidth: heroLayout.headlineMaxWidth.nutrition,
      },
      date: {
        ...typography.eyebrow,
        color: colors.inkMuted,
      },
      overline: {
        ...typography.eyebrow,
        color: colors.pulse,
        marginTop: spacing.sm,
      },
      calorieValue: {
        ...typography.metricLarge,
        marginTop: spacing.xs,
      },
      targetLine: {
        ...typography.callout,
        color: colors.inkMuted,
        marginTop: spacing.xs,
      },
      heroProgress: {
        marginTop: spacing.md,
      },
      chipField: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: heroLayout.chipRowGap,
        marginTop: heroLayout.chipRowMarginTop,
      },
      chip: {
        flex: 1,
        minWidth: "30%",
      },
      chipWide: {
        flexBasis: "100%",
        transform: [{ translateY: spacing.xs }],
      },
    }),
  );

  const remainingCalories = formatRemainingCalories(caloriesCurrent, caloriesTarget);
  const dateLabel = formatNutritionDate();

  return (
    <HeroAmbientLayer style={styles.hero}>
      <View style={styles.content}>
        <HeroEntrance delay={0}>
          <View style={styles.headlineBlock}>
            <Text style={styles.date}>{dateLabel}</Text>
            <Text style={styles.overline}>Daily calories</Text>
            <Text style={styles.calorieValue}>{caloriesCurrent.toLocaleString("en-US")}</Text>
            <Text style={styles.targetLine}>
              of {caloriesTarget.toLocaleString("en-US")} kcal target
            </Text>
            <ProgressBar progress={completionPercent} height={6} style={styles.heroProgress} />
          </View>
        </HeroEntrance>

        <View style={styles.chipField}>
          <FloatingStatChip
            label="Remaining"
            value={formatCalorieLabel(remainingCalories)}
            icon="pie-chart-outline"
            tone="accent"
            style={styles.chip}
            enterIndex={0}
          />
          <FloatingStatChip
            label="Complete"
            value={formatCompletionPercent(completionPercent)}
            icon="checkmark-circle-outline"
            tone="warm"
            style={styles.chip}
            enterIndex={1}
          />
          <FloatingStatChip
            label="Target"
            value={formatCalorieLabel(caloriesTarget)}
            icon="flag-outline"
            tone="neutral"
            style={styles.chipWide}
            enterIndex={2}
          />
        </View>
      </View>
    </HeroAmbientLayer>
  );
}
