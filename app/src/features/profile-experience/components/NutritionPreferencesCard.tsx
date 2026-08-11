import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { NutritionPreferences } from "../models";

export interface NutritionPreferencesCardProps {
  readonly prefs: NutritionPreferences;
}

export function NutritionPreferencesCard({ prefs }: NutritionPreferencesCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.title3 },
    row: { flexDirection: "row" as const, gap: spacing.lg },
    label: { ...typography.caption, color: colors.inkMuted },
    value: { ...typography.body },
    tags: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: spacing.xs },
    tag: { ...typography.caption, color: colors.pulse },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Nutrition Preferences</Text>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Approach</Text>
            <Text style={styles.value}>{prefs.dietaryApproach.replace(/_/g, " ")}</Text>
          </View>
          <View>
            <Text style={styles.label}>Calories</Text>
            <Text style={styles.value}>{prefs.calorieTarget > 0 ? `${prefs.calorieTarget} kcal` : "—"}</Text>
          </View>
          <View>
            <Text style={styles.label}>Meals/day</Text>
            <Text style={styles.value}>{prefs.mealsPerDay > 0 ? prefs.mealsPerDay : "—"}</Text>
          </View>
        </View>
        {prefs.allergies.length > 0 ? (
          <View>
            <Text style={styles.label}>Allergies</Text>
            <View style={styles.tags}>
              {prefs.allergies.map((a) => (
                <Text key={a} style={styles.tag}>{a}</Text>
              ))}
            </View>
          </View>
        ) : null}
        {prefs.supplements.length > 0 ? (
          <View>
            <Text style={styles.label}>Supplements</Text>
            <View style={styles.tags}>
              {prefs.supplements.map((s) => (
                <Text key={s} style={styles.tag}>{s}</Text>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </AppCard>
  );
}
