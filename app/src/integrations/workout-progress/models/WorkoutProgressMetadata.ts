/** Immutable metadata attached to every workout progress event. */
export interface WorkoutProgressMetadata {
  readonly source: "workout";
  readonly correlationId: string;
  readonly sessionId: string;
  readonly workoutId: string | null;
  readonly athleteId: string | null;
  readonly publishedAt: string;
}

export function createWorkoutProgressMetadata(
  input: WorkoutProgressMetadata,
): WorkoutProgressMetadata {
  return Object.freeze({ ...input });
}
