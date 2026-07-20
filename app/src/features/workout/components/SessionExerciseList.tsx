import { StyleSheet, Text, View } from "react-native";
import type { WorkoutSessionExercise } from "../../training/application";
import { AppCard } from "../../../components/AppCard";
import { ProgressBar } from "../../../components/ProgressBar";
import { SectionTitle } from "../../../components/SectionTitle";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type {
  ExerciseProgressSnapshot,
  SetExecutionState,
} from "../types/sessionExecutionState";
import {
  formatSessionExerciseIntensity,
  formatSessionSetsSummary,
} from "../utils/sessionPresentationFormatters";
import { SessionSetRow } from "./SessionSetRow";
import { WorkoutExercisePreviewRow } from "./WorkoutExercisePreviewRow";

interface SessionExerciseListProps {
  exercises: readonly WorkoutSessionExercise[];
  getSetState: (setId: string) => SetExecutionState;
  getExerciseProgress: (exercise: WorkoutSessionExercise) => ExerciseProgressSnapshot;
  onCompleteSet: (setId: string, defaultReps: number) => void;
  onUncompleteSet: (setId: string) => void;
  onSkipSet: (setId: string) => void;
  onUnskipSet: (setId: string) => void;
  onUpdateCompletedReps: (setId: string, reps: number | null) => void;
  onUpdateCompletedLoad: (setId: string, load: number | null) => void;
}

/**
 * Interactive ordered exercise + set list for local session execution.
 * Presentation only — mutation lives in the session interaction hook.
 */
export function SessionExerciseList({
  exercises,
  getSetState,
  getExerciseProgress,
  onCompleteSet,
  onUncompleteSet,
  onSkipSet,
  onUnskipSet,
  onUpdateCompletedReps,
  onUpdateCompletedLoad,
}: SessionExerciseListProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      section: {
        gap: spacing.md,
      },
      header: {
        gap: spacing.xs,
      },
      countLabel: {
        ...typography.callout,
        color: colors.inkMuted,
        marginTop: -spacing.sm,
      },
      card: {
        overflow: "hidden",
      },
      setDetail: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        gap: spacing.md,
      },
      exerciseProgress: {
        gap: spacing.xs,
        paddingLeft: spacing["3xl"] + spacing.md,
        marginBottom: spacing.xs,
      },
      exerciseProgressLabel: {
        ...typography.caption,
        color: colors.inkSecondary,
        fontWeight: "600",
      },
      progressionNote: {
        ...typography.caption,
        color: colors.pulse,
        paddingLeft: spacing["3xl"] + spacing.md,
        marginTop: spacing.xs,
      },
      dividerTrack: {
        paddingLeft: spacing["3xl"] + spacing.md + spacing.lg,
        paddingRight: spacing.lg,
      },
      divider: {
        height: 1,
        backgroundColor: colors.border,
        opacity: 0.9,
      },
    }),
  );

  const exerciseCountLabel =
    exercises.length === 1 ? "1 movement" : `${exercises.length} movements`;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <SectionTitle title="Exercises" />
        <Text style={styles.countLabel}>{exerciseCountLabel}</Text>
      </View>

      <AppCard style={styles.card} variant="floating" padding="none">
        {exercises.map((exercise, index) => {
          const isLast = index === exercises.length - 1;
          const progress = getExerciseProgress(exercise);
          const progressLabel =
            progress.totalSets === 0
              ? "No sets"
              : `${progress.accountedSets} / ${progress.totalSets} sets`;

          return (
            <View key={exercise.id}>
              <WorkoutExercisePreviewRow
                orderNumber={index + 1}
                name={exercise.name}
                workingSetsSummary={formatSessionSetsSummary(exercise.sets)}
                intensity={formatSessionExerciseIntensity(exercise.sets)}
                isPrimary={index === 0}
                showDivider={false}
              />
              {exercise.sets.length > 0 ? (
                <View style={styles.setDetail}>
                  <View style={styles.exerciseProgress}>
                    <Text style={styles.exerciseProgressLabel}>{progressLabel}</Text>
                    <ProgressBar progress={progress.percent} height={4} />
                  </View>
                  {exercise.sets.map((set) => (
                    <SessionSetRow
                      key={set.id}
                      set={set}
                      execution={getSetState(set.id)}
                      onComplete={() => onCompleteSet(set.id, set.targetReps.min)}
                      onUncomplete={() => onUncompleteSet(set.id)}
                      onSkip={() => onSkipSet(set.id)}
                      onUnskip={() => onUnskipSet(set.id)}
                      onRepsChange={(reps) => onUpdateCompletedReps(set.id, reps)}
                      onLoadChange={(load) => onUpdateCompletedLoad(set.id, load)}
                    />
                  ))}
                  {exercise.progressionReference ? (
                    <Text style={styles.progressionNote} numberOfLines={2}>
                      {exercise.progressionReference}
                    </Text>
                  ) : null}
                </View>
              ) : null}
              {!isLast ? (
                <View style={styles.dividerTrack}>
                  <View style={styles.divider} />
                </View>
              ) : null}
            </View>
          );
        })}
      </AppCard>
    </View>
  );
}
