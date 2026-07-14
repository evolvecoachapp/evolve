import type { ExerciseDifficulty } from "./ExerciseDifficulty";

/** A single prescribed or logged set within an exercise. */
export interface ExerciseSet {
  id: string;
  setNumber: number;
  targetReps: number | null;
  targetWeight: number | null;
  completedReps: number | null;
  completedWeight: number | null;
  rpe: number | null;
  completed: boolean;
  restSeconds: number | null;
  /** Percentage of 1RM when percentage-based prescriptions are used. */
  percentage?: number | null;
  /** Reps in reserve target for RIR-based prescriptions. */
  rir?: number | null;
  perceivedDifficulty?: ExerciseDifficulty | null;
}
