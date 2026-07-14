/** Completion metrics for a finished workout session. */
export interface WorkoutSummary {
  sessionId: string;
  workoutId: string;
  title: string;
  durationMinutes: number;
  completedSets: number;
  totalSets: number;
  skippedExercises: number;
  completedAt: string;
}
