import type { WorkoutState } from "../models/WorkoutState";

const ALLOWED_TRANSITIONS: Readonly<
  Record<WorkoutState, readonly WorkoutState[]>
> = Object.freeze({
  NotStarted: Object.freeze(["Running", "Cancelled"] as const),
  Running: Object.freeze(["Paused", "Completed", "Cancelled"] as const),
  Paused: Object.freeze(["Running", "Completed", "Cancelled"] as const),
  Completed: Object.freeze([] as const),
  Cancelled: Object.freeze([] as const),
});

/**
 * Whether a session state transition is allowed.
 */
export function canTransitionWorkoutState(
  from: WorkoutState,
  to: WorkoutState,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Validate a proposed state transition. Returns issue codes (empty if valid).
 */
export function validateStateTransition(
  from: WorkoutState,
  to: WorkoutState,
): readonly string[] {
  if (from === to) {
    return Object.freeze([`noop_transition:${from}`]);
  }
  if (!canTransitionWorkoutState(from, to)) {
    return Object.freeze([`invalid_transition:${from}->${to}`]);
  }
  return Object.freeze([]);
}

export function getAllowedTransitions(
  from: WorkoutState,
): readonly WorkoutState[] {
  return ALLOWED_TRANSITIONS[from];
}
