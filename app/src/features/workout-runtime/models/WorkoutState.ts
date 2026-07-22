/**
 * Session-level lifecycle state for an active workout runtime.
 *
 * Alias: SessionState (same union).
 */
export type WorkoutState =
  | "NotStarted"
  | "Running"
  | "Paused"
  | "Completed"
  | "Cancelled";

/** Architecture alias for WorkoutState. */
export type SessionState = WorkoutState;

export const WORKOUT_STATES = Object.freeze([
  "NotStarted",
  "Running",
  "Paused",
  "Completed",
  "Cancelled",
] as const satisfies readonly WorkoutState[]);

export const TERMINAL_WORKOUT_STATES = Object.freeze([
  "Completed",
  "Cancelled",
] as const satisfies readonly WorkoutState[]);

export function isTerminalWorkoutState(state: WorkoutState): boolean {
  return state === "Completed" || state === "Cancelled";
}
