/** Strength change for a single tracked exercise. */
export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  startWeightKg: number;
  currentWeightKg: number;
  changePercent: number;
}
