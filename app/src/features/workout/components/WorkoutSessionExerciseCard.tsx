import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { heroEntering } from "../../../animation/entering";
import { useReduceMotion } from "../../../animation/useReduceMotion";
import { AppCard } from "../../../components/AppCard";
import { Chip } from "../../../components/Chip";
import { ProgressBar } from "../../../components/ProgressBar";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutExercise } from "../models/WorkoutExercise";
import { enrichExercise } from "../utils/exerciseEnrichment";
import { formatMuscleGroupLabel, formatWorkingSetsSummary } from "../utils/presentationFormatters";
import { getExerciseSetProgress } from "../utils/sessionSelectors";
import { toLegacyExerciseSet } from "../utils/workoutAdapters";
import { ExerciseDetailPanel } from "./ExerciseDetailPanel";
import { ExerciseMediaPlaceholder } from "./ExerciseMediaPlaceholder";
import { WorkoutWarmupSetsList } from "./WorkoutWarmupSetsList";

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
  const reduceMotion = useReduceMotion();
  const enriched = enrichExercise(exercise.exercise);
  const exerciseProgress = getExerciseSetProgress(exercise);

  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      card: {
        gap: spacing.lg,
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
      progressSection: {
        gap: spacing.xs,
      },
      progressLabel: {
        ...typography.caption,
        color: colors.inkMuted,
        fontWeight: "600",
      },
    }),
  );

  return (
    <Animated.View entering={heroEntering(0, reduceMotion)}>
      <AppCard variant="elevated" style={styles.card}>
        <Text style={styles.eyebrow}>
          Exercise {exerciseNumber} of {exerciseTotal}
        </Text>

        <ExerciseMediaPlaceholder
          imageUrl={enriched.imageUrl}
          videoUrl={enriched.videoUrl}
          exerciseName={enriched.name}
        />

        <Text style={styles.title}>{enriched.name}</Text>

        <View style={styles.metaRow}>
          <Chip label={formatMuscleGroupLabel(enriched.muscleGroup)} />
          <Text style={styles.summary}>
            {formatWorkingSetsSummary(exercise.workingSets.map(toLegacyExerciseSet))}
          </Text>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>
            Exercise progress · {exerciseProgress.completed} / {exerciseProgress.total} sets
          </Text>
          <ProgressBar progress={exerciseProgress.percent} height={4} />
        </View>

        <View style={styles.setBadge}>
          <Text style={styles.setBadgeText}>
            Set {setNumber} of {setTotal}
          </Text>
        </View>

        <WorkoutWarmupSetsList warmupSets={exercise.warmupSets} />
        <ExerciseDetailPanel exercise={enriched} />
      </AppCard>
    </Animated.View>
  );
}
