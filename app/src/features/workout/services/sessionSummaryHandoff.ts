import type { WorkoutSessionSummary } from "../types/workoutSessionSummary";

/**
 * Single-slot in-memory handoff for a local `WorkoutSessionSummary`
 * built when the athlete presses Finish Workout.
 *
 * Not persistence: consuming clears the slot.
 */
let pendingSummary: WorkoutSessionSummary | null = null;

/** Stashes a summary immediately before navigating to the complete screen. */
export function setPendingSessionSummary(summary: WorkoutSessionSummary): void {
  pendingSummary = summary;
}

/** Consumes (and clears) the pending summary if its session id matches. */
export function consumePendingSessionSummary(
  sessionId: string,
): WorkoutSessionSummary | null {
  if (pendingSummary && pendingSummary.sessionId === sessionId) {
    const summary = pendingSummary;
    pendingSummary = null;
    return summary;
  }
  return null;
}
