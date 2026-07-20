import { useCallback, useMemo, useState } from "react";
import type { WorkoutSession, WorkoutSessionExercise } from "../../training/application";
import type {
  ExerciseProgressSnapshot,
  SessionExecutionState,
  SessionInteractionStatus,
  SessionProgressSnapshot,
  SetExecutionState,
} from "../types/sessionExecutionState";
import {
  completeSet,
  computeExerciseProgress,
  computeSessionProgress,
  createInitialExecutionState,
  deriveInteractionStatus,
  getSetExecution,
  skipSet,
  uncompleteSet,
  unskipSet,
  updateCompletedLoad,
  updateCompletedReps,
} from "../utils/sessionExecutionState";

export interface UseLocalSessionInteractionResult {
  /** Immutable prescription session (unchanged). */
  session: WorkoutSession;
  /** Local execution overlay — never mutates `session`. */
  execution: SessionExecutionState;
  /** Coarse status for UI chips. */
  interactionStatus: SessionInteractionStatus;
  sessionProgress: SessionProgressSnapshot;
  getExerciseProgress: (exercise: WorkoutSessionExercise) => ExerciseProgressSnapshot;
  getSetState: (setId: string) => SetExecutionState;
  completeSet: (setId: string, defaultReps: number) => void;
  uncompleteSet: (setId: string) => void;
  skipSet: (setId: string) => void;
  unskipSet: (setId: string) => void;
  updateCompletedReps: (setId: string, reps: number | null) => void;
  updateCompletedLoad: (setId: string, load: number | null) => void;
}

/**
 * Local-only interactive session state.
 * Holds an execution overlay beside the immutable application `WorkoutSession`.
 * No persistence, sync, timers, or Training Engine access.
 */
export function useLocalSessionInteraction(
  session: WorkoutSession,
): UseLocalSessionInteractionResult {
  const [execution, setExecution] = useState<SessionExecutionState>(() =>
    createInitialExecutionState(session),
  );

  const sessionProgress = useMemo(
    () => computeSessionProgress(session, execution),
    [session, execution],
  );

  const interactionStatus = useMemo(
    () => deriveInteractionStatus(sessionProgress),
    [sessionProgress],
  );

  const getExerciseProgress = useCallback(
    (exercise: WorkoutSessionExercise) => computeExerciseProgress(exercise, execution),
    [execution],
  );

  const getSetState = useCallback(
    (setId: string) => getSetExecution(execution, setId),
    [execution],
  );

  const handleCompleteSet = useCallback((setId: string, defaultReps: number) => {
    setExecution((current) => completeSet(current, setId, defaultReps));
  }, []);

  const handleUncompleteSet = useCallback((setId: string) => {
    setExecution((current) => uncompleteSet(current, setId));
  }, []);

  const handleSkipSet = useCallback((setId: string) => {
    setExecution((current) => skipSet(current, setId));
  }, []);

  const handleUnskipSet = useCallback((setId: string) => {
    setExecution((current) => unskipSet(current, setId));
  }, []);

  const handleUpdateCompletedReps = useCallback((setId: string, reps: number | null) => {
    setExecution((current) => updateCompletedReps(current, setId, reps));
  }, []);

  const handleUpdateCompletedLoad = useCallback((setId: string, load: number | null) => {
    setExecution((current) => updateCompletedLoad(current, setId, load));
  }, []);

  return {
    session,
    execution,
    interactionStatus,
    sessionProgress,
    getExerciseProgress,
    getSetState,
    completeSet: handleCompleteSet,
    uncompleteSet: handleUncompleteSet,
    skipSet: handleSkipSet,
    unskipSet: handleUnskipSet,
    updateCompletedReps: handleUpdateCompletedReps,
    updateCompletedLoad: handleUpdateCompletedLoad,
  };
}
