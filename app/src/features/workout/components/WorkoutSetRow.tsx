import { StyleSheet, Text, View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { CompletedWorkoutSet } from "../models/CompletedWorkout";
import { calculateSetVolume } from "../utils/setVolume";
import { formatSessionVolumeKg } from "../utils/sessionSummaryFormatters";

interface WorkoutSetRowProps {
  set: CompletedWorkoutSet;
}

/** Read-only completed set row: number, weight, reps, and calculated volume. */
export function WorkoutSetRow({ set }: WorkoutSetRowProps) {
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      row: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.border,
      },
      setNumber: {
        ...typography.caption,
        color: colors.pulse,
        fontWeight: "700",
        minWidth: spacing["2xl"],
      },
      meta: {
        flex: 1,
        gap: spacing.xs,
      },
      primary: {
        ...typography.bodyMedium,
        color: colors.ink,
      },
      volume: {
        ...typography.caption,
        color: colors.inkSecondary,
        fontWeight: "600",
      },
    }),
  );

  const volume = calculateSetVolume(set.weightKg, set.reps);

  return (
    <View
      style={styles.row}
      testID={`workout-set-row-${set.id}`}
      accessibilityLabel={`Set ${set.setNumber}, ${set.weightKg} kilograms, ${set.reps} reps, volume ${formatSessionVolumeKg(volume)}`}
    >
      <Text style={styles.setNumber}>#{set.setNumber}</Text>
      <View style={styles.meta}>
        <Text style={styles.primary}>
          {formatWeight(set.weightKg)} × {set.reps} reps
        </Text>
      </View>
      <Text style={styles.volume}>{formatSessionVolumeKg(volume)}</Text>
    </View>
  );
}

function formatWeight(weightKg: number): string {
  return `${weightKg} kg`;
}
