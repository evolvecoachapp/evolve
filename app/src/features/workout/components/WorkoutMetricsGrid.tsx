import { StyleSheet, View } from "react-native";
import { FloatingStatChip } from "../../../components/FloatingStatChip";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { CompletedWorkout } from "../models/CompletedWorkout";
import {
  formatSessionDuration,
  formatSessionVolumeKg,
} from "../utils/sessionSummaryFormatters";

interface WorkoutMetricsGridProps {
  workout: CompletedWorkout;
}

/** Metric chips for duration, volume, exercises, and set accounting. */
export function WorkoutMetricsGrid({ workout }: WorkoutMetricsGridProps) {
  const styles = useThemedStyles(() =>
    StyleSheet.create({
      grid: {
        gap: spacing.md,
      },
      row: {
        flexDirection: "row",
        gap: spacing.md,
      },
      chip: {
        flex: 1,
        minWidth: 0,
      },
    }),
  );

  return (
    <View style={styles.grid} testID="workout-metrics-grid">
      <View style={styles.row}>
        <FloatingStatChip
          style={styles.chip}
          label="Duration"
          value={formatSessionDuration(workout.durationSeconds)}
          icon="time-outline"
          tone="accent"
          enterIndex={0}
        />
        <FloatingStatChip
          style={styles.chip}
          label="Volume"
          value={formatSessionVolumeKg(workout.estimatedVolumeKg)}
          icon="barbell-outline"
          tone="neutral"
          enterIndex={1}
        />
      </View>
      <View style={styles.row}>
        <FloatingStatChip
          style={styles.chip}
          label="Exercises"
          value={`${workout.completedExercises} / ${workout.totalExercises}`}
          icon="fitness-outline"
          tone="neutral"
          enterIndex={2}
        />
        <FloatingStatChip
          style={styles.chip}
          label="Completed sets"
          value={String(workout.completedSets)}
          icon="layers-outline"
          tone="warm"
          enterIndex={3}
        />
      </View>
      <View style={styles.row}>
        <FloatingStatChip
          style={styles.chip}
          label="Skipped sets"
          value={String(workout.skippedSets)}
          icon="remove-circle-outline"
          tone="neutral"
          enterIndex={4}
        />
      </View>
    </View>
  );
}
