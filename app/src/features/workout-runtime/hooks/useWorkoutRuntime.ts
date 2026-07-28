import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { WorkoutRuntimeExperienceService } from "../services/experience";
import { WorkoutRuntimeViewModel } from "../viewmodels";

export interface UseWorkoutRuntimeOptions {
  readonly service?: WorkoutRuntimeExperienceService;
  readonly autoLoad?: boolean;
}

/**
 * Subscribes to WorkoutRuntimeViewModel — no business logic in the hook.
 */
export function useWorkoutRuntime({
  service,
  autoLoad = true,
}: UseWorkoutRuntimeOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);

  const viewModel = useMemo(
    () => new WorkoutRuntimeViewModel({ service }),
    [service],
  );

  useEffect(() => {
    return viewModel.subscribe(bump);
  }, [viewModel]);

  useEffect(() => {
    if (autoLoad) {
      void viewModel.loadWorkout();
    }
  }, [viewModel, autoLoad]);

  const loadWorkout = useCallback(
    () => viewModel.loadWorkout(),
    [viewModel],
  );
  const refresh = useCallback(() => viewModel.refresh(), [viewModel]);
  const completeSet = useCallback(() => viewModel.completeSet(), [viewModel]);
  const skipExercise = useCallback(
    () => viewModel.skipExercise(),
    [viewModel],
  );
  const nextExercise = useCallback(
    () => viewModel.nextExercise(),
    [viewModel],
  );
  const previousExercise = useCallback(
    () => viewModel.previousExercise(),
    [viewModel],
  );
  const updateWeight = useCallback(
    (weight: number | null) => viewModel.updateWeight(weight),
    [viewModel],
  );
  const updateRepetitions = useCallback(
    (repetitions: number | null) => viewModel.updateRepetitions(repetitions),
    [viewModel],
  );
  const updateRPE = useCallback(
    (rpe: number | null) => viewModel.updateRPE(rpe),
    [viewModel],
  );
  const updateNotes = useCallback(
    (notes: string) => viewModel.updateNotes(notes),
    [viewModel],
  );
  const startRestTimer = useCallback(
    (targetSeconds?: number) => viewModel.startRestTimer(targetSeconds),
    [viewModel],
  );
  const pauseRestTimer = useCallback(
    () => viewModel.pauseRestTimer(),
    [viewModel],
  );
  const resumeRestTimer = useCallback(
    () => viewModel.resumeRestTimer(),
    [viewModel],
  );
  const openFinishDialog = useCallback(
    () => viewModel.openFinishDialog(),
    [viewModel],
  );
  const closeFinishDialog = useCallback(
    () => viewModel.closeFinishDialog(),
    [viewModel],
  );
  const finishWorkout = useCallback(
    () => viewModel.finishWorkout(),
    [viewModel],
  );

  return {
    runtime: viewModel.runtime,
    currentExercise: viewModel.currentExercise(),
    currentSet: viewModel.currentSet(),
    loading: viewModel.loading,
    error: viewModel.error,
    isEmpty: viewModel.isEmpty,
    finishDialogVisible: viewModel.finishDialogVisible,
    loadWorkout,
    refresh,
    completeSet,
    skipExercise,
    nextExercise,
    previousExercise,
    updateWeight,
    updateRepetitions,
    updateRPE,
    updateNotes,
    startRestTimer,
    pauseRestTimer,
    resumeRestTimer,
    openFinishDialog,
    closeFinishDialog,
    finishWorkout,
    viewModel,
  };
}
