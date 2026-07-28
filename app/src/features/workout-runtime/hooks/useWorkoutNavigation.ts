import { useCallback } from "react";
import type { WorkoutRuntimeViewModel } from "../viewmodels";

export interface UseWorkoutNavigationOptions {
  readonly viewModel: WorkoutRuntimeViewModel;
}

/** Navigation helpers bound to the WorkoutRuntimeViewModel. */
export function useWorkoutNavigation({
  viewModel,
}: UseWorkoutNavigationOptions) {
  const nextExercise = useCallback(
    () => viewModel.nextExercise(),
    [viewModel],
  );
  const previousExercise = useCallback(
    () => viewModel.previousExercise(),
    [viewModel],
  );
  const skipExercise = useCallback(
    () => viewModel.skipExercise(),
    [viewModel],
  );
  const goToExercise = useCallback(
    (index: number) => viewModel.goToExercise(index),
    [viewModel],
  );

  return {
    nextExercise,
    previousExercise,
    skipExercise,
    goToExercise,
    canGoNext:
      (viewModel.runtime?.currentExerciseIndex ?? 0) <
      (viewModel.runtime?.exercises.length ?? 1) - 1,
    canGoPrevious: (viewModel.runtime?.currentExerciseIndex ?? 0) > 0,
    historyDestination: viewModel.runtime?.historyDestination ?? null,
    statisticsDestination: viewModel.runtime?.statisticsDestination ?? null,
    currentExerciseDetailDestination:
      viewModel.currentExercise()?.detailDestination ?? null,
  };
}
