import { Pressable, ScrollView, Text, View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutExercise } from "../models/experience/WorkoutExercise";
import { WorkoutExerciseStatuses } from "../models/experience/WorkoutExercise";

interface ExerciseCarouselProps {
  readonly exercises: readonly WorkoutExercise[];
  readonly currentIndex: number;
  readonly onSelect?: (index: number) => void;
}

/** Horizontal exercise order strip — presentation only. */
export function ExerciseCarousel({
  exercises,
  currentIndex,
  onSelect,
}: ExerciseCarouselProps) {
  const styles = useThemedStyles(({ colors, typography, radius }) => ({
    row: {
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    chip: {
      minWidth: 120,
      minHeight: spacing["3xl"] + spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceElevated,
      justifyContent: "center" as const,
      gap: 2,
    },
    chipCurrent: {
      borderColor: colors.pulse,
      backgroundColor: colors.pulseMuted,
    },
    chipDone: {
      opacity: 0.7,
    },
    index: {
      ...typography.caption,
      color: colors.inkMuted,
      fontWeight: "700" as const,
    },
    name: {
      ...typography.caption,
      color: colors.ink,
      fontWeight: "600" as const,
    },
  }));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {exercises.map((exercise, index) => {
        const isCurrent = index === currentIndex;
        const isDone = exercise.status === WorkoutExerciseStatuses.COMPLETED;
        return (
          <Pressable
            key={exercise.id}
            accessibilityRole="button"
            accessibilityLabel={`Exercise ${index + 1}: ${exercise.name}`}
            onPress={() => onSelect?.(index)}
            style={({ pressed }) => [
              styles.chip,
              isCurrent && styles.chipCurrent,
              isDone && styles.chipDone,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.index}>
              {index + 1}/{exercises.length}
            </Text>
            <Text style={styles.name} numberOfLines={1}>
              {exercise.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
