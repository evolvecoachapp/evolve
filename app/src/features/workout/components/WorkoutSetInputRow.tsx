import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { chipEntering } from "../../../animation/entering";
import { useReduceMotion } from "../../../animation/useReduceMotion";
import { AppInput } from "../../../components/AppInput";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface WorkoutSetInputRowProps {
  weightInput: string;
  repsInput: string;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
  /** Prescribed rep target for the current set. */
  targetReps?: number | null;
  /** Whether weight was auto-filled from the previous working set. */
  weightAutoFilled?: boolean;
}

export function WorkoutSetInputRow({
  weightInput,
  repsInput,
  onWeightChange,
  onRepsChange,
  error,
  disabled = false,
  targetReps,
  weightAutoFilled = false,
}: WorkoutSetInputRowProps) {
  const reduceMotion = useReduceMotion();
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      row: {
        flexDirection: "row",
        gap: spacing.md,
      },
      field: {
        flex: 1,
        marginBottom: 0,
      },
      hints: {
        gap: spacing.xs,
        marginTop: spacing.sm,
      },
      hint: {
        ...typography.caption,
        color: colors.inkMuted,
      },
      targetHint: {
        ...typography.caption,
        color: colors.pulse,
        fontWeight: "600",
        alignSelf: "flex-start",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        backgroundColor: colors.pulseMuted,
      },
      autoFillHint: {
        ...typography.caption,
        color: colors.inkSecondary,
      },
    }),
  );

  return (
    <Animated.View entering={chipEntering(0, reduceMotion)}>
      <View>
        <View style={styles.row}>
          <AppInput
            label="Weight (kg)"
            value={weightInput}
            onChangeText={onWeightChange}
            keyboardType="decimal-pad"
            editable={!disabled}
            placeholder="0"
            style={styles.field}
            error={error}
          />
          <AppInput
            label="Reps"
            value={repsInput}
            onChangeText={onRepsChange}
            keyboardType="number-pad"
            editable={!disabled}
            placeholder="0"
            style={styles.field}
          />
        </View>
        <View style={styles.hints}>
          {targetReps ? <Text style={styles.targetHint}>Target · ~{targetReps} reps</Text> : null}
          {weightAutoFilled && weightInput ? (
            <Text style={styles.autoFillHint}>Weight carried from your last working set</Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}
