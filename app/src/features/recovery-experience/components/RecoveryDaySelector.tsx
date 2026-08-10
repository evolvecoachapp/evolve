import { Pressable, Text, View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { RecoveryDay } from "../models";

export interface RecoveryDaySelectorProps {
  readonly value: RecoveryDay;
  readonly options: readonly RecoveryDay[];
  readonly onChange: (day: RecoveryDay) => void;
}

export function RecoveryDaySelector({ value, options, onChange }: RecoveryDaySelectorProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    row: { flexDirection: "row" as const, gap: spacing.sm },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceElevated,
    },
    active: {
      borderColor: colors.pulse,
      backgroundColor: colors.pulseMuted,
    },
    text: { ...typography.callout },
  }));

  return (
    <View style={styles.row}>
      {options.map((option) => (
        <Pressable
          key={option.id}
          onPress={() => onChange(option)}
          style={[styles.chip, option.isoDate === value.isoDate && styles.active]}
        >
          <Text style={styles.text}>{option.shortLabel}</Text>
        </Pressable>
      ))}
    </View>
  );
}
