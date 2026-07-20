import type { WorkoutSession, WorkoutSessionExercise } from "../../training/application";
import {
  EMPTY_SESSION_EXECUTION,
  EMPTY_SET_EXECUTION,
  type ExerciseProgressSnapshot,
  type SessionExecutionState,
  type SessionInteractionStatus,
  type SessionProgressSnapshot,
  type SetExecutionState,
} from "../types/sessionExecutionState";

/** Resolve execution overlay for a set id, defaulting to pending. */
export function getSetExecution(
  execution: SessionExecutionState,
  setId: string,
): SetExecutionState {
  return execution.sets[setId] ?? EMPTY_SET_EXECUTION;
}

/** Seed an empty overlay for every set in the immutable session. */
export function createInitialExecutionState(session: WorkoutSession): SessionExecutionState {
  const sets: Record<string, SetExecutionState> = {};
  for (const exercise of session.exercises) {
    for (const set of exercise.sets) {
      sets[set.id] = EMPTY_SET_EXECUTION;
    }
  }
  return Object.freeze({ sets: Object.freeze(sets) });
}

function replaceSetState(
  execution: SessionExecutionState,
  setId: string,
  next: SetExecutionState,
): SessionExecutionState {
  return Object.freeze({
    sets: Object.freeze({
      ...execution.sets,
      [setId]: Object.freeze(next),
    }),
  });
}

/**
 * Mark a set completed. Defaults `completedReps` to the prescribed min when unset.
 * No-ops if the set is currently skipped (unskip first).
 */
export function completeSet(
  execution: SessionExecutionState,
  setId: string,
  defaultReps: number,
): SessionExecutionState {
  const current = getSetExecution(execution, setId);
  if (current.status === "skipped") {
    return execution;
  }

  return replaceSetState(execution, setId, {
    status: "completed",
    completedReps: current.completedReps ?? defaultReps,
    completedLoad: current.completedLoad,
  });
}

/** Return a completed set to pending, preserving entered reps/load. */
export function uncompleteSet(
  execution: SessionExecutionState,
  setId: string,
): SessionExecutionState {
  const current = getSetExecution(execution, setId);
  if (current.status !== "completed") {
    return execution;
  }

  return replaceSetState(execution, setId, {
    status: "pending",
    completedReps: current.completedReps,
    completedLoad: current.completedLoad,
  });
}

/** Skip a set. Cleared completion status; preserves any entered values. */
export function skipSet(
  execution: SessionExecutionState,
  setId: string,
): SessionExecutionState {
  const current = getSetExecution(execution, setId);
  return replaceSetState(execution, setId, {
    status: "skipped",
    completedReps: current.completedReps,
    completedLoad: current.completedLoad,
  });
}

/** Restore a skipped set to pending. */
export function unskipSet(
  execution: SessionExecutionState,
  setId: string,
): SessionExecutionState {
  const current = getSetExecution(execution, setId);
  if (current.status !== "skipped") {
    return execution;
  }

  return replaceSetState(execution, setId, {
    status: "pending",
    completedReps: current.completedReps,
    completedLoad: current.completedLoad,
  });
}

/** Update completed reps. Allowed for any status (values retained across transitions). */
export function updateCompletedReps(
  execution: SessionExecutionState,
  setId: string,
  completedReps: number | null,
): SessionExecutionState {
  const current = getSetExecution(execution, setId);
  const normalized =
    completedReps === null ? null : Math.max(0, Math.floor(completedReps));

  return replaceSetState(execution, setId, {
    ...current,
    completedReps: normalized,
  });
}

/** Update completed load (kg). Allowed for any status. */
export function updateCompletedLoad(
  execution: SessionExecutionState,
  setId: string,
  completedLoad: number | null,
): SessionExecutionState {
  const current = getSetExecution(execution, setId);
  const normalized =
    completedLoad === null ? null : Math.max(0, roundLoad(completedLoad));

  return replaceSetState(execution, setId, {
    ...current,
    completedLoad: normalized,
  });
}

function roundLoad(value: number): number {
  return Math.round(value * 100) / 100;
}

function buildProgressCounts(
  setIds: readonly string[],
  execution: SessionExecutionState,
): Omit<SessionProgressSnapshot, "percent"> {
  let completedSets = 0;
  let skippedSets = 0;

  for (const setId of setIds) {
    const status = getSetExecution(execution, setId).status;
    if (status === "completed") {
      completedSets += 1;
    } else if (status === "skipped") {
      skippedSets += 1;
    }
  }

  const totalSets = setIds.length;
  const accountedSets = completedSets + skippedSets;
  const pendingSets = totalSets - accountedSets;

  return { totalSets, completedSets, skippedSets, accountedSets, pendingSets };
}

function toPercent(accounted: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((accounted / total) * 100);
}

/** Session-level progress from prescription + local execution overlay. */
export function computeSessionProgress(
  session: WorkoutSession,
  execution: SessionExecutionState,
): SessionProgressSnapshot {
  const setIds = session.exercises.flatMap((exercise) =>
    exercise.sets.map((set) => set.id),
  );
  const counts = buildProgressCounts(setIds, execution);
  return {
    ...counts,
    percent: toPercent(counts.accountedSets, counts.totalSets),
  };
}

/** Per-exercise progress snapshot. */
export function computeExerciseProgress(
  exercise: WorkoutSessionExercise,
  execution: SessionExecutionState,
): ExerciseProgressSnapshot {
  const setIds = exercise.sets.map((set) => set.id);
  const counts = buildProgressCounts(setIds, execution);
  return {
    exerciseId: exercise.id,
    ...counts,
    percent: toPercent(counts.accountedSets, counts.totalSets),
    isComplete: counts.totalSets > 0 && counts.pendingSets === 0,
  };
}

/** Derive a coarse interaction status for hero chips (local only). */
export function deriveInteractionStatus(
  progress: SessionProgressSnapshot,
): SessionInteractionStatus {
  if (progress.totalSets === 0 || progress.accountedSets === 0) {
    return "ready";
  }
  if (progress.pendingSets === 0) {
    return "completed";
  }
  return "in_progress";
}

/** Reset overlay to the initial empty state for a session. */
export function resetExecutionState(session: WorkoutSession): SessionExecutionState {
  return createInitialExecutionState(session);
}

/** True when execution has no recorded interactions. */
export function isExecutionPristine(execution: SessionExecutionState): boolean {
  return Object.values(execution.sets).every(
    (set) =>
      set.status === "pending" &&
      set.completedReps === null &&
      set.completedLoad === null,
  );
}

export { EMPTY_SESSION_EXECUTION, EMPTY_SET_EXECUTION };
