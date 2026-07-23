/**
 * Immutable exercise suggestion parsed from provider output.
 */
export interface CoachExercise {
  readonly id: string;
  readonly name: string;
  readonly sets: number | null;
  readonly reps: string | null;
  readonly notes: string | null;
}
