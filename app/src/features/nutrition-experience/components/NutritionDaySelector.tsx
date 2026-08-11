import { Pressable, Text, View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { NutritionDay } from "../models";

export interface NutritionDaySelectorProps {
  readonly value: NutritionDay;
  readonly options: readonly NutritionDay[];
  readonly onChange: (day: NutritionDay) => void;
}

export function NutritionDaySelector({ value, options, onChange }: NutritionDaySelectorProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    row: { flexDirection: "row" as const, gap: spacing.sm },
    chip: {
      minHeight: spacing["3xl"],
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceElevated,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    active: {
      borderColor: colors.pulse,
      backgroundColor: colors.pulseMuted,
    },
    text: { ...typography.callout },
    textActive: { color: colors.pulse, fontWeight: "700" as const },
  }));

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isActive = option.isoDate === value.isoDate;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option)}
            style={[styles.chip, isActive && styles.active]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={option.shortLabel}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>{option.shortLabel}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
