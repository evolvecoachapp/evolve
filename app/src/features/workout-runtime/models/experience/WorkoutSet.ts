export const WorkoutSetStatuses = {
  PENDING: "pending",
  CURRENT: "current",
  COMPLETED: "completed",
  SKIPPED: "skipped",
} as const;

export type WorkoutSetStatus =
  (typeof WorkoutSetStatuses)[keyof typeof WorkoutSetStatuses];

/** Immutable presentation model for one workout set. */
export interface WorkoutSet {
  readonly id: string;
  readonly exerciseId: string;
  readonly index: number;
  readonly targetReps: number;
  readonly targetRepsMax: number | null;
  readonly targetRpe: number | null;
  readonly weight: number | null;
  readonly repetitions: number | null;
  readonly rpe: number | null;
  readonly notes: string;
  readonly status: WorkoutSetStatus;
  readonly completed: boolean;
  readonly restSeconds: number;
}

export function createWorkoutSet(input: WorkoutSet): WorkoutSet {
  return Object.freeze({ ...input });
}
