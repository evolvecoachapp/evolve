import type { WorkoutProgressEventType } from "../events";

/** Immutable publisher snapshot — represent only. */
export interface WorkoutProgressSnapshot {
  readonly publishedEventCount: number;
  readonly lastEventId: string | null;
  readonly lastEventType: WorkoutProgressEventType | null;
  readonly capturedAt: string;
}

export function createWorkoutProgressSnapshot(
  input: WorkoutProgressSnapshot,
): WorkoutProgressSnapshot {
  return Object.freeze({ ...input });
}
