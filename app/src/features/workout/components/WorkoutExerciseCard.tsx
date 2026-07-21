import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { CompletedWorkoutExercise } from "../models/CompletedWorkout";
import { WorkoutSetRow } from "./WorkoutSetRow";

interface WorkoutExerciseCardProps {
  exercise: CompletedWorkoutExercise;
  exerciseNumber: number;
  exerciseTotal: number;
}

/** Read-only exercise card listing completed sets for workout detail. */
export function WorkoutExerciseCard({
  exercise,
  exerciseNumber,
  exerciseTotal,
}: WorkoutExerciseCardProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      card: {
        gap: spacing.md,
      },
      header: {
        gap: spacing.xs,
      },
      eyebrow: {
        ...typography.caption,
        color: colors.inkMuted,
        fontWeight: "600",
      },
      title: {
        ...typography.title3,
        color: colors.ink,
      },
      empty: {
        ...typography.callout,
        color: colors.inkMuted,
      },
      sets: {
        gap: spacing.sm,
      },
    }),
  );

  return (
    <View testID={`workout-exercise-card-${exercise.id}`}>
      <AppCard variant="elevated" style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            Exercise {exerciseNumber} of {exerciseTotal}
          </Text>
          <Text style={styles.title}>{exercise.name}</Text>
        </View>
        {exercise.sets.length === 0 ? (
          <Text style={styles.empty}>No completed sets</Text>
        ) : (
          <View style={styles.sets}>
            {exercise.sets.map((set) => (
              <WorkoutSetRow key={set.id} set={set} />
            ))}
          </View>
        )}
      </AppCard>
    </View>
  );
}
