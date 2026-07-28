import { View } from "react-native";
import { RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "../../../components/GradientBackground";
import { TabScreenContainer } from "../../../components/TabScreenContainer";
import { useTheme } from "../../../theme/ThemeContext";
import { floatingFooterMetrics, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import {
  EmptyWorkout,
  ErrorWorkout,
  ExerciseCard,
  ExerciseCarousel,
  FinishWorkoutDialog,
  NotesCard,
  RepetitionInput,
  RestTimerCard,
  RPESelector,
  SetList,
  SkeletonWorkout,
  WeightInput,
  WorkoutBottomBar,
  WorkoutProgressBar,
  WorkoutRuntimeHeader,
  WorkoutStatisticsCard,
} from "../components";
import {
  usePullToRefresh,
  useRestTimer,
  useWorkoutNavigation,
  useWorkoutProgress,
  useWorkoutRuntime,
} from "../hooks";
import { WorkoutSetStatuses } from "../models/experience/WorkoutSet";
import type { WorkoutRuntimeExperienceService } from "../services/experience";

export interface WorkoutRuntimeScreenProps {
  readonly service?: WorkoutRuntimeExperienceService;
}

/**
 * Operational Workout Runtime screen — composition only.
 * No business logic; data via ViewModel → Application → ExperienceService.
 */
export function WorkoutRuntimeScreen({
  service,
}: WorkoutRuntimeScreenProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const workout = useWorkoutRuntime({ service });
  const navigation = useWorkoutNavigation({ viewModel: workout.viewModel });
  const rest = useRestTimer({ viewModel: workout.viewModel });
  const progress = useWorkoutProgress({ runtime: workout.runtime });

  const pull = usePullToRefresh({
    onRefresh: workout.refresh,
    refreshing: workout.loading.isRefreshing,
  });

  const styles = useThemedStyles(() => ({
    stack: {
      gap: spacing.lg,
      paddingBottom: floatingFooterMetrics.scrollReserve(
        floatingFooterMetrics.workoutContentHeight + spacing["3xl"],
      ),
    },
    editors: {
      flexDirection: "row" as const,
      gap: spacing.md,
    },
  }));

  const navigatePlaceholder = (destination: string | null) => {
    if (!destination) {
      return;
    }
    router.push(destination as never);
  };

  const canCompleteSet =
    !!workout.currentSet &&
    workout.currentSet.status === WorkoutSetStatuses.CURRENT &&
    !workout.runtime?.state.isCompleted;

  const canFinish =
    !!workout.runtime &&
    !workout.runtime.isEmpty &&
    !workout.runtime.state.isCompleted;

  return (
    <GradientBackground variant="canvas">
      <TabScreenContainer
        gradient={false}
        withHeader={false}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
        }}
        refreshControl={
          <RefreshControl
            refreshing={pull.refreshing}
            onRefresh={pull.onRefresh}
            tintColor={colors.pulse}
            colors={[colors.pulse]}
          />
        }
      >
        <View style={styles.stack}>
          {workout.loading.isLoading && !workout.runtime ? (
            <SkeletonWorkout />
          ) : null}

          {workout.error && !workout.loading.isLoading ? (
            <ErrorWorkout
              error={workout.error}
              onRetry={() => void workout.refresh()}
            />
          ) : null}

          {!workout.loading.isLoading &&
          !workout.error &&
          workout.isEmpty ? (
            <EmptyWorkout />
          ) : null}

          {!workout.loading.isLoading &&
          !workout.error &&
          workout.runtime &&
          !workout.isEmpty ? (
            <>
              <WorkoutRuntimeHeader
                runtime={workout.runtime}
                onHistoryPress={() =>
                  navigatePlaceholder(navigation.historyDestination)
                }
                onStatisticsPress={() =>
                  navigatePlaceholder(navigation.statisticsDestination)
                }
              />

              <WorkoutProgressBar progress={progress.progress!} />

              <ExerciseCarousel
                exercises={workout.runtime.exercises}
                currentIndex={workout.runtime.currentExerciseIndex}
                onSelect={navigation.goToExercise}
              />

              {workout.currentExercise ? (
                <ExerciseCard
                  exercise={workout.currentExercise}
                  onDetailsPress={() =>
                    navigatePlaceholder(
                      navigation.currentExerciseDetailDestination,
                    )
                  }
                />
              ) : null}

              <RestTimerCard
                timer={workout.runtime.timer}
                onPause={rest.pause}
                onResume={rest.resume}
              />

              {workout.currentExercise ? (
                <SetList sets={workout.currentExercise.sets} />
              ) : null}

              {workout.currentSet && !workout.runtime.state.isCompleted ? (
                <>
                  <View style={styles.editors}>
                    <WeightInput
                      value={workout.currentSet.weight}
                      onChange={workout.updateWeight}
                    />
                    <RepetitionInput
                      value={workout.currentSet.repetitions}
                      onChange={workout.updateRepetitions}
                    />
                  </View>
                  <RPESelector
                    value={workout.currentSet.rpe}
                    onChange={workout.updateRPE}
                  />
                </>
              ) : null}

              <NotesCard
                notes={workout.runtime.notes}
                onChange={workout.updateNotes}
              />

              <WorkoutStatisticsCard
                statistics={progress.statistics!}
              />
            </>
          ) : null}
        </View>
      </TabScreenContainer>

      {workout.runtime && !workout.isEmpty && !workout.error ? (
        <WorkoutBottomBar
          onCompleteSet={workout.completeSet}
          onSkipExercise={navigation.skipExercise}
          onPrevious={navigation.previousExercise}
          onNext={navigation.nextExercise}
          onFinish={workout.openFinishDialog}
          canCompleteSet={canCompleteSet}
          canFinish={canFinish}
        />
      ) : null}

      <FinishWorkoutDialog
        visible={workout.finishDialogVisible}
        onConfirm={() => void workout.finishWorkout()}
        onCancel={workout.closeFinishDialog}
      />
    </GradientBackground>
  );
}
