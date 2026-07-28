/** Immutable session notes presentation model. */
export interface WorkoutNotes {
  readonly sessionNotes: string;
  readonly lastUpdatedAt: string | null;
}

export function createWorkoutNotes(
  sessionNotes = "",
  lastUpdatedAt: string | null = null,
): WorkoutNotes {
  return Object.freeze({
    sessionNotes,
    lastUpdatedAt,
  });
}
