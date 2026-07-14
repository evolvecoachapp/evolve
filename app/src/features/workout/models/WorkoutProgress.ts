/** Progress metrics for an in-progress or completed workout session. */
export interface WorkoutProgress {
  sessionId: string;
  completedSets: number;
  totalSets: number;
  completedExercises: number;
  totalExercises: number;
  percentComplete: number;
}
