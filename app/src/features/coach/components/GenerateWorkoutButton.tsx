import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AnimatedPressable } from "../../../animation/AnimatedPressable";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

export interface GenerateWorkoutButtonProps {
  readonly onPress: () => void;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly label?: string;
}

/** Coach Screen CTA — requests WorkoutPlan through the generation pipeline. */
export function GenerateWorkoutButton({
  onPress,
  loading = false,
  disabled = false,
  label = "Generate Workout",
}: GenerateWorkoutButtonProps) {
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      wrap: {
        paddingHorizontal: 0,
        paddingBottom: spacing.sm,
      },
      button: {
        minHeight: spacing["2xl"] + spacing.sm,
        borderRadius: radius.md,
        backgroundColor: colors.pulse,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
        opacity: disabled || loading ? 0.6 : 1,
      },
      label: {
        ...typography.button,
        color: colors.textOnInk,
      },
      row: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
      },
    }),
  );

  return (
    <View style={styles.wrap}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={disabled || loading}
        onPress={onPress}
        style={styles.button}
      >
        <View style={styles.row}>
          {loading ? <ActivityIndicator color={styles.label.color} /> : null}
          <Text style={styles.label}>{label}</Text>
        </View>
      </AnimatedPressable>
    </View>
  );
}
