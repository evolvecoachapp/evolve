import { Pressable, Text, View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface RPESelectorProps {
  readonly value: number | null;
  readonly onChange: (value: number) => void;
}

const RPE_VALUES = [6, 7, 8, 9, 10] as const;

/** RPE selector — presentation only. */
export function RPESelector({ value, onChange }: RPESelectorProps) {
  const styles = useThemedStyles(({ colors, typography, radius }) => ({
    container: {
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    label: {
      ...typography.caption,
      color: colors.inkSecondary,
      fontWeight: "600" as const,
    },
    row: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: spacing.sm,
    },
    chip: {
      minWidth: spacing["3xl"] + spacing.sm,
      minHeight: spacing["3xl"] + spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceElevated,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      paddingHorizontal: spacing.md,
    },
    chipActive: {
      borderColor: colors.pulse,
      backgroundColor: colors.pulseMuted,
    },
    chipLabel: {
      ...typography.callout,
      fontWeight: "700" as const,
      color: colors.ink,
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>RPE</Text>
      <View style={styles.row}>
        {RPE_VALUES.map((rpe) => {
          const active = value === rpe;
          return (
            <Pressable
              key={rpe}
              accessibilityRole="button"
              accessibilityLabel={`RPE ${rpe}`}
              onPress={() => onChange(rpe)}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.chipLabel}>{rpe}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
