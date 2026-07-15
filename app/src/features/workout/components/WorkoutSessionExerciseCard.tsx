import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { Chip } from "../../../components/Chip";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutExercise } from "../models/WorkoutExercise";
import { formatMuscleGroupLabel, formatWorkingSetsSummary } from "../utils/presentationFormatters";
import { toLegacyExerciseSet } from "../utils/workoutAdapters";

interface WorkoutSessionExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseNumber: number;
  exerciseTotal: number;
  setNumber: number;
  setTotal: number;
}

export function WorkoutSessionExerciseCard({
  exercise,
  exerciseNumber,
  exerciseTotal,
  setNumber,
  setTotal,
}: WorkoutSessionExerciseCardProps) {
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      card: {
        gap: spacing.md,
      },
      eyebrow: {
        ...typography.caption,
        color: colors.inkSecondary,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.6,
      },
      title: {
        ...typography.title2,
      },
      metaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        alignItems: "center",
      },
      setBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        backgroundColor: colors.pulseMuted,
      },
      setBadgeText: {
        ...typography.caption,
        color: colors.pulse,
        fontWeight: "700",
      },
      summary: {
        ...typography.callout,
        color: colors.inkSecondary,
      },
    }),
  );

  return (
    <AppCard variant="elevated" style={styles.card}>
      <Text style={styles.eyebrow}>
        Exercise {exerciseNumber} of {exerciseTotal}
      </Text>
      <Text style={styles.title}>{exercise.exercise.name}</Text>

      <View style={styles.metaRow}>
        <Chip label={formatMuscleGroupLabel(exercise.exercise.muscleGroup)} />
        <Text style={styles.summary}>
          {formatWorkingSetsSummary(exercise.workingSets.map(toLegacyExerciseSet))}
        </Text>
      </View>

      <View style={styles.setBadge}>
        <Text style={styles.setBadgeText}>
          Set {setNumber} of {setTotal}
        </Text>
      </View>
    </AppCard>
  );
}
