import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { loadHydratedWorkoutRuntime } from "../application/loadHydratedWorkoutRuntime";
import type { WorkoutRuntimeExperienceService } from "../services/experience";
import { WorkoutRuntimeViewModel } from "../viewmodels";

export interface UseWorkoutRuntimeOptions {
  readonly service?: WorkoutRuntimeExperienceService;
  readonly viewModel?: WorkoutRuntimeViewModel;
  readonly athleteId?: string;
  readonly autoLoad?: boolean;
}

/**
 * Subscribes to WorkoutRuntimeViewModel — no business logic in the hook.
 * Production path applies hydrated workspace output via applyHydratedWorkout().
 * WorkoutRuntimeExperienceService is test/preview-only when injected explicitly.
 */
export function useWorkoutRuntime({
  service,
  viewModel: injected,
  athleteId,
  autoLoad = true,
}: UseWorkoutRuntimeOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const { status: runtimeStatus } = useRuntimeSession();
  const isRuntimePath = service === undefined && injected === undefined;
  const athleteKey = athleteId ?? "";

  const viewModel = useMemo(
    () => injected ?? new WorkoutRuntimeViewModel({ service, athleteId }),
    [injected, service, athleteId],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  useEffect(() => {
    if (!autoLoad || injected) {
      return;
    }

    if (!isRuntimePath) {
      void viewModel.loadWorkout();
      return;
    }

    if (!athleteId) {
      return;
    }

    if (runtimeStatus !== RUNTIME_SESSION_STATUS.ready) {
      return;
    }

    let cancelled = false;

    void loadHydratedWorkoutRuntime({ athleteId }).then((runtime) => {
      if (cancelled) {
        return;
      }

      if (runtime) {
        viewModel.applyHydratedWorkout(runtime);
        return;
      }

      viewModel.applyWorkoutFailure("Workout runtime unavailable.");
    });

    return () => {
      cancelled = true;
    };
  }, [autoLoad, injected, viewModel, isRuntimePath, athleteKey, athleteId, runtimeStatus]);

  const loadWorkout = useCallback(
    () => viewModel.loadWorkout(),
    [viewModel],
  );

  const refresh = useCallback(async () => {
    if (service) {
      await viewModel.refresh();
      return;
    }

    if (!athleteId) {
      viewModel.applyWorkoutFailure("Workout runtime unavailable.");
      return;
    }

    const runtime = await loadHydratedWorkoutRuntime({ athleteId });
    viewModel.refreshFromHydratedWorkout(runtime);
  }, [viewModel, service, athleteId]);

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
