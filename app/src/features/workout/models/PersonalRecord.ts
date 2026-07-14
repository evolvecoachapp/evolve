import type { ExerciseMuscleGroup } from "./ExerciseMuscleGroup";

/** Personal record entry for a tracked lift. */
export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: ExerciseMuscleGroup;
  weight: number;
  reps: number;
  achievedAt: string;
  sessionId: string;
}
