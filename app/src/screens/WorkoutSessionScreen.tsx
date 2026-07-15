import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { GradientBackground } from "../components/GradientBackground";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ScreenContainer } from "../components/ScreenContainer";
import { SettingsHeader } from "../components/SettingsHeader";
import {
  RestTimerOverlay,
  SetUndoBanner,
  WorkoutFinishNotes,
  WorkoutProgressHeader,
  formatElapsed,
  WorkoutSessionExerciseCard,
  WorkoutSessionFooter,
  WorkoutSetInputRow,
} from "../features/workout/components";
import { useActiveWorkoutSession } from "../features/workout/hooks/useActiveWorkoutSession";
import type { WorkoutSession } from "../features/workout/models/WorkoutSession";
import { formatMuscleGroupLabel } from "../features/workout/utils/presentationFormatters";
import {
  countSessionCompletedWorkingSets,
  countSessionWorkingSets,
  countTotalExercises,
  getExerciseSetProgress,
} from "../features/workout/utils/sessionSelectors";
import { serializeWorkoutSummaryParams } from "../features/workout/utils/summaryRouteParams";
import { floatingFooterMetrics, spacing } from "../theme/theme";
import { useTheme } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";

interface WorkoutSessionScreenProps {
  sessionId: string;
  initialSession?: WorkoutSession;
}

export function WorkoutSessionScreen({ sessionId, initialSession }: WorkoutSessionScreenProps) {
  const { colors } = useTheme();
  const {
    session,
    loading,
    error,
    saving,
    finishing,
    inputError,
    weightInput,
    repsInput,
    weightAutoFilled,
    finishNotes,
    setWeightInput,
    setRepsInput,
    setFinishNotes,
    position,
    elapsedSeconds,
    isResting,
    restSecondsLeft,
    restDurationSeconds,
    skipRest,
    addRestSeconds,
    subtractRestSeconds,
    isComplete,
    pendingUndo,
    undoSecondsRemaining,
    completeSet,
    undoLastSet,
    dismissUndo,
    finishWorkout,
  } = useActiveWorkoutSession({ sessionId, initialSession });

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: "transparent",
      },
      message: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        lineHeight: 24,
        textAlign: "center",
        paddingHorizontal: spacing.screenPadding,
      },
      content: {
        gap: spacing.xl,
      },
      finishEarlyLink: {
        alignSelf: "center",
      },
    }),
  );

  const handleFinish = async () => {
    const summary = await finishWorkout();
    if (!summary) {
      return;
    }

    router.replace({
      pathname: "/(app)/workout/summary",
      params: serializeWorkoutSummaryParams(summary),
    });
  };

  if (loading) {
    return (
      <GradientBackground variant="canvas">
        <View style={styles.screen}>
          <SettingsHeader title="Active Workout" />
          <LoadingSpinner color={colors.ink} />
        </View>
      </GradientBackground>
    );
  }

  if (error || !session) {
    return (
      <GradientBackground variant="canvas">
        <View style={styles.screen}>
          <SettingsHeader title="Active Workout" />
          <ScreenContainer gradient={false} withHeader={false}>
            <Text style={styles.message}>{error ?? "Workout session not found."}</Text>
          </ScreenContainer>
        </View>
      </GradientBackground>
    );
  }

  const exerciseTotal = countTotalExercises(session.exercises);
  const totalWorkingSets = countSessionWorkingSets(session.exercises);
  const completedWorkingSets = countSessionCompletedWorkingSets(session.exercises);
  const sessionProgress = totalWorkingSets > 0 ? (completedWorkingSets / totalWorkingSets) * 100 : 0;
  const exerciseProgress = position ? getExerciseSetProgress(position.exercise) : null;
  const footerReserve = floatingFooterMetrics.scrollReserve(
    floatingFooterMetrics.workoutContentHeight,
  );
  const showFinishNotes = !position || isComplete;

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <SettingsHeader title="Active Workout" />
        <ScreenContainer gradient={false} withHeader={false} footerReserve={footerReserve}>
          <View style={styles.content}>
            <WorkoutProgressHeader
              completedSets={completedWorkingSets}
              totalSets={totalWorkingSets}
              sessionProgress={sessionProgress}
              exerciseProgress={exerciseProgress?.percent ?? null}
              exerciseLabel={
                position
                  ? `${position.exercise.exercise.name} · ${exerciseProgress?.completed ?? 0} / ${exerciseProgress?.total ?? 0} sets`
                  : null
              }
              elapsedLabel={`${formatElapsed(elapsedSeconds)} elapsed`}
            />

            {pendingUndo ? (
              <SetUndoBanner
                secondsRemaining={undoSecondsRemaining}
                onUndo={() => void undoLastSet()}
                onDismiss={dismissUndo}
              />
            ) : null}

            {position ? (
              <WorkoutSessionExerciseCard
                exercise={position.exercise}
                exerciseNumber={position.exerciseIndex + 1}
                exerciseTotal={exerciseTotal}
                setNumber={position.setIndex + 1}
                setTotal={position.exercise.workingSets.length}
              />
            ) : (
              <Text style={styles.message}>All sets logged. Finish when you are ready.</Text>
            )}

            {isResting ? (
              <RestTimerOverlay
                secondsLeft={restSecondsLeft}
                totalSeconds={restDurationSeconds}
                onSkipRest={skipRest}
                onAddTime={addRestSeconds}
                onSubtractTime={subtractRestSeconds}
                nextExerciseName={position?.exercise.exercise.name ?? null}
                nextSetLabel={
                  position
                    ? `Set ${position.setIndex + 1} of ${position.exercise.workingSets.length}`
                    : null
                }
                nextMuscleGroupLabel={
                  position ? formatMuscleGroupLabel(position.exercise.exercise.muscleGroup) : null
                }
              />
            ) : position ? (
              <>
                <WorkoutSetInputRow
                  weightInput={weightInput}
                  repsInput={repsInput}
                  onWeightChange={setWeightInput}
                  onRepsChange={setRepsInput}
                  error={inputError}
                  targetReps={position.set.targetReps}
                  weightAutoFilled={weightAutoFilled}
                />
                {!isComplete ? (
                  <AppButton
                    label="Finish Workout Early"
                    variant="ghost"
                    size="sm"
                    onPress={() => void handleFinish()}
                    disabled={saving || finishing}
                    style={styles.finishEarlyLink}
                  />
                ) : null}
              </>
            ) : null}

            {showFinishNotes ? (
              <WorkoutFinishNotes
                value={finishNotes}
                onChange={setFinishNotes}
                disabled={saving || finishing}
              />
            ) : null}
          </View>
        </ScreenContainer>

        {!isResting ? (
          <WorkoutSessionFooter
            label={position ? "Complete Set" : "Finish Workout"}
            summary={`${completedWorkingSets} / ${totalWorkingSets} sets logged`}
            onPress={position ? () => void completeSet() : () => void handleFinish()}
            loading={position ? saving : finishing}
            disabled={saving || finishing}
          />
        ) : null}
      </View>
    </GradientBackground>
  );
}
