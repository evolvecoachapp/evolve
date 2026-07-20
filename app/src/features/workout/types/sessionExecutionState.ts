/**
 * Local UI execution state for an interactive workout session.
 *
 * Kept separate from the immutable application-layer `WorkoutSession` so
 * prescription data stays frozen while the athlete interacts with sets.
 * No persistence, sync, timers, or AI — in-memory only.
 */

export type SetExecutionStatus = "pending" | "completed" | "skipped";

/** Per-set athlete interaction overlay. */
export interface SetExecutionState {
  readonly status: SetExecutionStatus;
  readonly completedReps: number | null;
  readonly completedLoad: number | null;
}

/**
 * Mutable (via immutable updates) execution overlay keyed by set id.
 * Does not clone or mutate the original `WorkoutSession`.
 */
export interface SessionExecutionState {
  readonly sets: Readonly<Record<string, SetExecutionState>>;
}

/** Aggregated progress for the whole session. */
export interface SessionProgressSnapshot {
  readonly totalSets: number;
  /** Sets marked completed (not skipped). */
  readonly completedSets: number;
  readonly skippedSets: number;
  /** Sets that are either completed or skipped. */
  readonly accountedSets: number;
  readonly pendingSets: number;
  /** 0–100 based on accounted / total. */
  readonly percent: number;
}

/** Aggregated progress for a single exercise. */
export interface ExerciseProgressSnapshot {
  readonly exerciseId: string;
  readonly totalSets: number;
  readonly completedSets: number;
  readonly skippedSets: number;
  readonly accountedSets: number;
  readonly pendingSets: number;
  readonly percent: number;
  /** True when every set is completed or skipped. */
  readonly isComplete: boolean;
}

export type SessionInteractionStatus = "ready" | "in_progress" | "completed";

export const EMPTY_SET_EXECUTION: SetExecutionState = Object.freeze({
  status: "pending",
  completedReps: null,
  completedLoad: null,
});

export const EMPTY_SESSION_EXECUTION: SessionExecutionState = Object.freeze({
  sets: Object.freeze({}),
});
