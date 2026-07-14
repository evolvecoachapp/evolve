import type { ExerciseMuscleGroup } from "./ExerciseMuscleGroup";

/** Historical record for a completed exercise within a past session. */
export interface ExerciseHistory {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: ExerciseMuscleGroup;
  sessionId: string;
  completedAt: string;
  topSetWeight: number | null;
  topSetReps: number | null;
  totalVolume: number;
}
