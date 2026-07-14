import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutExercise } from "../types";
import {
  formatExerciseIntensity,
  formatMuscleGroupLabel,
  formatWorkingSetsSummary,
} from "../utils/presentationFormatters";
import { WorkoutExercisePreviewRow } from "./WorkoutExercisePreviewRow";

interface WorkoutExercisePreviewListProps {
  exercises: WorkoutExercise[];
}

export function WorkoutExercisePreviewList({ exercises }: WorkoutExercisePreviewListProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      section: {
        gap: spacing.md,
      },
      header: {
        gap: spacing.xs,
      },
      title: {
        ...typography.title2,
      },
      countLabel: {
        ...typography.callout,
        color: colors.inkMuted,
      },
      card: {
        overflow: "hidden",
      },
    }),
  );

  const exerciseCountLabel = exercises.length === 1 ? "1 movement" : `${exercises.length} movements`;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Exercise lineup</Text>
        <Text style={styles.countLabel}>{exerciseCountLabel}</Text>
      </View>

      <AppCard style={styles.card} variant="floating" padding="none">
        {exercises.map((exercise, index) => (
          <WorkoutExercisePreviewRow
            key={exercise.id}
            orderNumber={index + 1}
            name={exercise.name}
            workingSetsSummary={formatWorkingSetsSummary(exercise.workingSets)}
            intensity={formatExerciseIntensity(exercise.workingSets)}
            muscleGroupLabel={formatMuscleGroupLabel(exercise.muscleGroup)}
            isPrimary={index === 0}
            showDivider={index < exercises.length - 1}
          />
        ))}
      </AppCard>
    </View>
  );
}
