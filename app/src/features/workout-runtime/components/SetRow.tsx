import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutSet } from "../models/experience/WorkoutSet";
import { WorkoutSetStatuses } from "../models/experience/WorkoutSet";

interface SetRowProps {
  readonly set: WorkoutSet;
}

/** Single set row — presentation only. */
export function SetRow({ set }: SetRowProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography, radius }) => ({
    row: {
      minHeight: spacing["3xl"] + spacing.sm,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceElevated,
      gap: spacing.sm,
    },
    current: {
      borderColor: colors.pulse,
      backgroundColor: colors.pulseMuted,
    },
    done: {
      opacity: 0.75,
    },
    left: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: spacing.sm,
      flex: 1,
    },
    index: {
      ...typography.callout,
      fontWeight: "700" as const,
      color: colors.ink,
      minWidth: 28,
    },
    meta: {
      ...typography.caption,
      color: colors.inkMuted,
    },
    values: {
      ...typography.callout,
      color: colors.inkSecondary,
      fontWeight: "600" as const,
    },
  }));

  const isCurrent = set.status === WorkoutSetStatuses.CURRENT;
  const isDone =
    set.status === WorkoutSetStatuses.COMPLETED ||
    set.status === WorkoutSetStatuses.SKIPPED;

  const repsLabel =
    set.targetRepsMax && set.targetRepsMax !== set.targetReps
      ? `${set.targetReps}–${set.targetRepsMax}`
      : `${set.targetReps}`;

  return (
    <View
      style={[
        styles.row,
        isCurrent && styles.current,
        isDone && styles.done,
      ]}
    >
      <View style={styles.left}>
        <Text style={styles.index}>{set.index + 1}</Text>
        {set.status === WorkoutSetStatuses.COMPLETED ? (
          <Ionicons name="checkmark-circle" size={spacing.icon.sm} color={colors.success} />
        ) : null}
        <Text style={styles.meta}>
          {set.status === WorkoutSetStatuses.COMPLETED
            ? "Done"
            : set.status === WorkoutSetStatuses.SKIPPED
              ? "Skipped"
              : isCurrent
                ? "Current"
                : "Pending"}
        </Text>
      </View>
      <Text style={styles.values}>
        {set.weight ?? "—"} kg · {set.repetitions ?? repsLabel} reps
        {set.rpe != null ? ` · RPE ${set.rpe}` : ""}
      </Text>
    </View>
  );
}
