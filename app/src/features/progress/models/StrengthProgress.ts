import type { ExerciseProgress } from "./ExerciseProgress";

/** Aggregate strength gains across tracked lifts. */
export interface StrengthProgress {
  overallChangePercent: number;
  periodWeeks: number;
  exercises: ExerciseProgress[];
}
