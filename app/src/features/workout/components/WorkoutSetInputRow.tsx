import { StyleSheet, Text, View } from "react-native";
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
  /** Prescribed rep target for the current set, e.g. "Target: ~8 reps". */
  targetReps?: number | null;
}

export function WorkoutSetInputRow({
  weightInput,
  repsInput,
  onWeightChange,
  onRepsChange,
  error,
  disabled = false,
  targetReps,
}: WorkoutSetInputRowProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      row: {
        flexDirection: "row",
        gap: spacing.md,
      },
      field: {
        flex: 1,
        marginBottom: 0,
      },
      hint: {
        ...typography.caption,
        color: colors.inkMuted,
        marginTop: spacing.xs,
      },
    }),
  );

  return (
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
      {targetReps ? <Text style={styles.hint}>Target: ~{targetReps} reps</Text> : null}
    </View>
  );
}
