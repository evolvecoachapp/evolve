/** Completion metrics for a finished workout session. */
export interface WorkoutSummary {
  sessionId: string;
  workoutId: string;
  title: string;
  durationMinutes: number;
  totalVolumeKg: number;
  completedSets: number;
  totalSets: number;
  completedExercises: number;
  totalExercises: number;
  skippedExercises: number;
  completedAt: string;
  /** Optional athlete notes captured at completion. */
  notes?: string | null;
}
