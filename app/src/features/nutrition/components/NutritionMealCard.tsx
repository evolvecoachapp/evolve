import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { Chip } from "../../../components/Chip";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { formatCalorieLabel, formatMacroGrams, resolveMealIcon } from "../utils";

interface NutritionMealCardProps {
  name: string;
  time: string;
  calories: number;
  proteinGrams?: number;
}

const MEAL_ICON_SIZE = spacing["3xl"] + spacing.sm;

export function NutritionMealCard({
  name,
  time,
  calories,
  proteinGrams,
}: NutritionMealCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      card: {
        overflow: "hidden",
      },
      row: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.md,
      },
      iconBadge: {
        width: MEAL_ICON_SIZE,
        height: MEAL_ICON_SIZE,
        borderRadius: radius.lg,
        backgroundColor: colors.pulseMuted,
        borderWidth: 1,
        borderColor: colors.borderPulse,
        alignItems: "center",
        justifyContent: "center",
      },
      content: {
        flex: 1,
        minWidth: 0,
        gap: spacing.md,
        paddingTop: spacing.xs,
      },
      name: {
        ...typography.title3,
        lineHeight: 26,
      },
      metaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
    }),
  );

  const mealIcon = resolveMealIcon(name);

  return (
    <AppCard variant="elevated" padding="compact" style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBadge}>
          <Ionicons name={mealIcon} size={spacing.icon.lg} color={colors.pulse} />
        </View>

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>

          <View style={styles.metaRow}>
            <Chip label={time} variant="neutral" size="sm" icon="time-outline" />
            <Chip
              label={formatCalorieLabel(calories)}
              variant="accent"
              size="sm"
              icon="flame-outline"
            />
            {proteinGrams !== undefined ? (
              <Chip
                label={formatMacroGrams(proteinGrams)}
                variant="outline"
                size="sm"
                icon="nutrition-outline"
              />
            ) : null}
          </View>
        </View>
      </View>
    </AppCard>
  );
}
