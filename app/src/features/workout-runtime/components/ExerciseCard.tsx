import { Pressable, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { Chip } from "../../../components/Chip";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutExercise } from "../models/experience/WorkoutExercise";

interface ExerciseCardProps {
  readonly exercise: WorkoutExercise;
  readonly onDetailsPress?: () => void;
}

/** Current exercise card — presentation only. */
export function ExerciseCard({ exercise, onDetailsPress }: ExerciseCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: {
      gap: spacing.md,
    },
    header: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
      gap: spacing.md,
    },
    titles: {
      flex: 1,
      gap: spacing.xs,
    },
    title: {
      ...typography.title3,
      color: colors.ink,
    },
    meta: {
      ...typography.callout,
      color: colors.inkMuted,
    },
    chips: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: spacing.sm,
    },
    details: {
      paddingVertical: spacing.sm,
    },
    detailsLabel: {
      ...typography.caption,
      color: colors.pulse,
      fontWeight: "700" as const,
    },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.titles}>
            <Text style={styles.title}>{exercise.name}</Text>
            <Text style={styles.meta}>
              {exercise.muscleGroup} · {exercise.equipment}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Exercise details"
            onPress={onDetailsPress}
            style={styles.details}
          >
            <Text style={styles.detailsLabel}>Details</Text>
          </Pressable>
        </View>
        <View style={styles.chips}>
          <Chip
            label={`Set ${exercise.currentSetIndex + 1}/${exercise.totalSetCount}`}
            variant="accent"
            size="sm"
          />
          <Chip
            label={`${exercise.progressPercent}%`}
            variant="neutral"
            size="sm"
          />
        </View>
      </View>
    </AppCard>
  );
}
