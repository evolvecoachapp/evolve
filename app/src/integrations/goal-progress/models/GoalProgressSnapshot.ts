import type { GoalProgressEventType } from "../events";

/** Immutable publisher snapshot — represent only. */
export interface GoalProgressSnapshot {
  readonly publishedEventCount: number;
  readonly lastEventId: string | null;
  readonly lastEventType: GoalProgressEventType | null;
  readonly capturedAt: string;
}

export function createGoalProgressSnapshot(
  input: GoalProgressSnapshot,
): GoalProgressSnapshot {
  return Object.freeze({ ...input });
}
