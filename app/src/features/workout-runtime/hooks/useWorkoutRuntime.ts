import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  workoutRuntimeExperienceService,
  type WorkoutRuntimeExperienceService,
} from "../services/experience";
import { WorkoutRuntimeViewModel } from "../viewmodels";

export interface UseWorkoutRuntimeOptions {
  readonly service?: WorkoutRuntimeExperienceService;
  readonly viewModel?: WorkoutRuntimeViewModel;
  readonly athleteId?: string;
  readonly autoLoad?: boolean;
}

/**
 * Subscribes to WorkoutRuntimeViewModel — no business logic in the hook.
 * Production path loads GET /workout-resolution/today via the experience
 * service (backend by default). Inject `service` or `viewModel` in tests.
 */
export function useWorkoutRuntime({
  service,
  viewModel: injected,
  athleteId,
  autoLoad = true,
}: UseWorkoutRuntimeOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const athleteKey = athleteId ?? "";

  const viewModel = useMemo(
    () =>
      injected ??
      new WorkoutRuntimeViewModel({
        service: service ?? workoutRuntimeExperienceService,
        athleteId,
      }),
    [injected, service, athleteId],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  useEffect(() => {
    if (!autoLoad || injected) {
      return;
    }

    void viewModel.loadWorkout();
  }, [autoLoad, injected, viewModel, athleteKey]);

  const loadWorkout = useCallback(
    () => viewModel.loadWorkout(),
    [viewModel],
  );

  const refresh = useCallback(async () => {
    await viewModel.refresh();
  }, [viewModel]);

  const completeSet = useCallback(
    () => viewModel.completeSetAsync(),
    [viewModel],
  );
  const startWorkout = useCallback(
    () => viewModel.startWorkout(),
    [viewModel],
  );
  const advanceRestDay = useCallback(
    () => viewModel.advanceRestDay(),
    [viewModel],
  );
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
    canStart: viewModel.canStart,
    isRestDay: viewModel.isRestDay,
    canFinishSession: viewModel.canFinishSession,
    finishDialogVisible: viewModel.finishDialogVisible,
    loadWorkout,
    refresh,
    startWorkout,
    advanceRestDay,
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
